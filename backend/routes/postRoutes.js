const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

const upload = require('../config/cloudinary');
const protect = require('../middleware/auth');


// =======================
// 1. Upload Image
// =======================
router.post('/upload', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  res.json({ imageUrl: req.file.path });
});


// =======================
// 2. GET MY POSTS (MUST COME BEFORE /:slug)
// =======================
router.get('/mine', protect, async (req, res) => {
  try {
     const posts = await Post.find({ author: req.user.id })
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch your posts" });
  }
});


// =======================
// 3. GET ALL POSTS
// =======================
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// =======================
// 4. CREATE POST
// =======================
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, excerpt, coverImage, seo } = req.body;

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');

    const post = new Post({
      title,
      slug,
      content,
      excerpt,
      coverImage,
      seo: seo || {
        metaTitle: title,
        metaDescription: excerpt
      },
      author: req.user.id
    });

    const newPost = await post.save();
    res.status(201).json(newPost);

  } catch (err) {
    console.error("❌ FULL ERROR:", err);
    res.status(400).json({
      message: err.message,
      errors: err.errors
    });
  }
});


// =======================
// 5. GET SINGLE POST BY SLUG (MUST BE LAST)
// =======================
router.get('/:slug', async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.views += 1;
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/edit/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: 'Post not found',
      });
    }

    res.json(post);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const {
      title,
      content,
      coverImage,
      tags,excerpt,
    } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: 'Post not found',
      });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Unauthorized to edit this post',
      });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.coverImage = coverImage !== undefined ? coverImage : post.coverImage;
    post.tags = tags !== undefined ? tags : post.tags;
    post.excerpt = excerpt !== undefined ? excerpt : post.excerpt;

    const updatedPost = await post.save();

    res.json({
      message: 'Post updated successfully',
      post: updatedPost,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: 'Post not found',
      });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Unauthorized to delete this post',
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Post deleted successfully',
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// =======================
// 6. CLAP POST
// =======================
router.put('/:id/clap', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.claps = (post.claps || 0) + 1;
    const updatedPost = await post.save();
    res.json({ claps: updatedPost.claps });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// =======================
// 7. ADD COMMENT
// =======================
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const user = await User.findById(req.user.id);
    const emailPart = user ? user.email.split('@')[0] : 'Scribe Writer';
    const userName = emailPart.charAt(0).toUpperCase() + emailPart.slice(1);

    const newComment = {
      user: req.user.id,
      userName: userName,
      text: text.trim(),
      createdAt: new Date()
    };

    post.comments = post.comments || [];
    post.comments.push(newComment);
    await post.save();

    res.status(201).json(newComment);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;