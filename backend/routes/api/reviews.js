const { Router } = require("express");
const express = require("express");

const { User } = require("../../db/models");

const { Spot } = require("../../db/models");

const { Review } = require("../../db/models");

const { ReviewImage } = require("../../db/models");

const { SpotImage } = require("../../db/models");

const sequelize = require("sequelize");

const { requireAuth } = require("../../utils/auth");

const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

const router = express.Router();

const validateReview = [
  check("review")
    .exists({ checkFalsy: true })
    .withMessage("Review text is required"),
  check("stars")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Stars must be an integer from 1 to 5"),
  handleValidationErrors,
];

//Create reviewImage based on reviewId
router.post("/:reviewId/images", requireAuth, async (req, res, next) => {
  const { url } = req.body;
  const reviewId = parseInt(req.params.reviewId);
  const user = req.user;

  const review = await Review.findByPk(reviewId);
  const reviewImages = await ReviewImage.findAll({
    where: {
      reviewId: reviewId,
    },
  });

  if (review) {
    if (user.id === review.userId) {
      if (reviewImages.length < 10) {
        const createdReviewImage = await ReviewImage.create({
          reviewId: reviewId,
          url: url,
        });
        const responseReviewImage = {
          id: createdReviewImage.id,
          url: createdReviewImage.url,
        };
        return res.status(200).json(responseReviewImage);
      } else
        return res.status(403).json({
          message: "Maximum number of images for this resource was reached",
        });
    } else
      return res.status(403).json({
        message: "Forbidden",
      });
  } else return res.status(404).json({ message: "Review couldn't be found" });
});

//Edit review by reviewId
router.put(
  "/:reviewId",
  requireAuth,
  validateReview,
  async (req, res, next) => {
    const { review, stars } = req.body;
    const reviewId = req.params.reviewId;
    const user = req.user;

    const currentReview = await Review.findByPk(reviewId);

    if (currentReview) {
      if (user.id === currentReview.userId) {
        currentReview.review = review;
        currentReview.stars = stars;
        await currentReview.save();
        return res.status(200).json(currentReview);
      } else return res.status(403).json({ message: "Forbidden" });
    } else return res.status(404).json({ message: "Review couldn't be found" });
  }
);

//Delete review by reviewID
router.delete("/:reviewId", requireAuth, async (req, res, next) => {
  const reviewId = req.params.reviewId;
  const user = req.user;

  const reviewToDelete = await Review.findByPk(reviewId);

  if (reviewToDelete) {
    if (user.id === reviewToDelete.userId) {
      await reviewToDelete.destroy();
      return res.status(200).json({ message: "Successfully deleted" });
    } else return res.status(403).json({ message: "Forbidden" });
  } else
    return res.status(404).json({
      message: "Review couldn't be found",
    });
});

//Delete a review image
router.delete("/:reviewId/images/:imageId", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const reviewId = req.params.reviewId;
  const imageId = req.params.imageId

  const review = await Review.findByPk(reviewId);
  const reviewImage = await ReviewImage.findByPk(imageId);

  if (!reviewImage) {
      return res.status(404).json({ message: "Review Image couldn't be found" })
  }

  if (review.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" })
  };

  await reviewImage.destroy()
  return res.status(200).json({ message: "Successfully deleted" })
});

module.exports = router;
