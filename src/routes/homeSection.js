const multer = require('multer');
const express = require('express');
const router = express.Router();
const { createHomeSection, getHomeSections, updateHomeSection, deleteHomeSection } = require('../controllers/homeSection');
const { requireSignin, requireAdmin } = require('../common-middleware');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/homeSection/create', requireSignin, requireAdmin, upload.single('image'), createHomeSection);
router.get('/homeSections', getHomeSections);
router.put('/homeSection/update/:id', requireSignin, requireAdmin, upload.single('image'), updateHomeSection);
router.delete('/homeSection/delete/:id', requireSignin, requireAdmin, deleteHomeSection);

module.exports = router;