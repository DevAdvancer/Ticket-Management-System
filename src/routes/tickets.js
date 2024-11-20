import express from 'express';
import { body, validationResult } from 'express-validator';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';
import Ticket from '../models/Ticket.js';
import Comment from '../models/Comment.js';

const router = express.Router();

// Create ticket (authenticated non-admin users only)
router.post('/',
  isAuthenticated,
  async (req, res) => {
    try {
      // Check if user is admin
      if (req.session.userRole === 'admin') {
        return res.status(403).json({ message: 'Admins cannot create tickets' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const ticket = new Ticket({
        title: req.body.title,
        description: req.body.description,
        creator: req.session.userId
      });

      await ticket.save();
      res.status(201).json(ticket);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get all tickets (authenticated users)
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate('creator', 'username')
      .sort({ createdAt: -1 });
    
    // Get comments for each ticket
    const ticketsWithComments = await Promise.all(tickets.map(async (ticket) => {
      const comments = await Comment.find({ ticket: ticket._id })
        .populate('admin', 'username')
        .sort({ createdAt: -1 });
      return {
        ...ticket.toObject(),
        comments
      };
    }));

    res.json(ticketsWithComments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update ticket status (admin only)
router.patch('/:id/status',
  isAuthenticated,
  isAdmin,
  [
    body('status').isIn(['pending', 'ongoing', 'resolved', 'rejected'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const ticket = await Ticket.findById(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      ticket.status = req.body.status;
      await ticket.save();
      
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete ticket (admin only)
router.delete('/:id',
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const ticket = await Ticket.findById(req.params.id);
      
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      // Delete associated comments first
      await Comment.deleteMany({ ticket: ticket._id });
      // Delete the ticket
      await ticket.deleteOne();

      res.json({ message: 'Ticket and associated comments deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Add comment (admin only)
router.post('/:id/comments',
  isAuthenticated,
  isAdmin,
  [
    body('content').trim().isLength({ min: 1 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const ticket = await Ticket.findById(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      const comment = new Comment({
        ticket: ticket._id,
        admin: req.session.userId,
        content: req.body.content
      });

      await comment.save();
      
      // Populate admin information before sending response
      await comment.populate('admin', 'username');
      
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;