const express = require('express');
const router = express.Router();

const { createIssue } = require('../controllers/issueController');
const { protectKey } = require('../controllers/authMiddleware');
const { getAllIssues } = require('../controllers/issueController');


router.post('/', protectKey, createIssue);
router.get('/', protectKey, getAllIssues);

module.exports = router;