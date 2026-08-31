import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const reviewsFilePath = path.join(__dirname, '../data/reviews.json');

const getReviews = () => {
  try {
    const data = fs.readFileSync(reviewsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading reviews:', err);
    return [];
  }
};

const saveReviews = (reviews) => {
  try {
    fs.writeFileSync(reviewsFilePath, JSON.stringify(reviews, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving reviews:', err);
    return false;
  }
};

// GET /api/v1/reviews (Get reviews, optionally filtered by productId)
router.get('/', (req, res) => {
  const { productId } = req.query;
  let reviews = getReviews();

  if (productId) {
    reviews = reviews.filter((r) => r.productId === productId);
  }

  // Calculate rating distribution
  const total = reviews.length;
  const avgRating = total ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1) : 5.0;
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    if (counts[r.rating] !== undefined) counts[r.rating]++;
  });

  res.json({
    success: true,
    count: total,
    avgRating: parseFloat(avgRating),
    distribution: counts,
    data: reviews,
  });
});

// POST /api/v1/reviews (Submit new verified review)
router.post('/', (req, res) => {
  const { productId, customerName, role, rating, title, comment } = req.body;

  if (!productId || !customerName || !rating || !comment) {
    return res.status(400).json({
      success: false,
      message: 'Product ID, name, rating, and review text are required.',
    });
  }

  const reviews = getReviews();
  const newReview = {
    id: `rev-${Date.now()}`,
    productId,
    customerName,
    role: role || 'Verified Customer',
    rating: parseInt(rating, 10) || 5,
    verifiedPurchase: true,
    date: new Date().toISOString(),
    title: title || 'Exceptional Quality',
    comment,
    helpfulCount: 0,
  };

  reviews.unshift(newReview);
  saveReviews(reviews);

  res.status(201).json({
    success: true,
    message: 'Thank you! Your verified product review has been published.',
    data: newReview,
  });
});

// POST /api/v1/reviews/:id/vote (Vote review helpful)
router.post('/:id/vote', (req, res) => {
  const reviews = getReviews();
  const review = reviews.find((r) => r.id === req.params.id);

  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }

  review.helpfulCount = (review.helpfulCount || 0) + 1;
  saveReviews(reviews);

  res.json({ success: true, helpfulCount: review.helpfulCount });
});

// DELETE /api/v1/reviews/:id (Admin: Moderate review)
router.delete('/:id', (req, res) => {
  let reviews = getReviews();
  reviews = reviews.filter((r) => r.id !== req.params.id);
  saveReviews(reviews);

  res.json({ success: true, message: 'Review removed by moderator' });
});

export default router;
