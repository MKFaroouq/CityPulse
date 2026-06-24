const express = require('express');
const router = express.Router();
const upload = require('../controllers/uploadMiddleware');

// const { createIssue } = require('../controllers/issueController');
// const { getAllIssues } = require('../controllers/issueController');
// const { updateIssueStatus } = require('../controllers/issueController');
// const { assignIssue } = require('../controllers/issueController');
// const { deleteIssue } = require('../controllers/issueController');

const { protectKey } = require('../controllers/authMiddleware');

const { 
    createIssue, 
    getAllIssues, 
    updateIssueStatus, 
    assignIssue, 
    deleteIssue 
} = require('../controllers/issueController');

// final routes:

// to get all issues
router.get('/', protectKey, getAllIssues);

// create a new issue with image upload
router.post('/createIssue', upload.single('image'), protectKey, createIssue);

// assign an issue to an engineer
router.post('/assignIssue', protectKey, assignIssue);

// update issue status by id
router.patch('/updateIssueStatus/:id', protectKey, updateIssueStatus);

// delete an issue by id
router.delete('/deleteIssue/:id', protectKey, deleteIssue);

// router.post('/', protectKey, createIssue);
// router.get('/', protectKey, getAllIssues);
// router.post('/', upload.single('image'), protectKey, createIssue);


// router.put('/assignIssue',protectKey, assignIssue);




// 💡 جعلنا الرابط يحتوي على كلمة /assign/ عشان مستحيل يتداخل مع أي مسار تاني
// router.put('/assign/engineer', assignIssue);
// // داخل ملف issueRoutes.js
// router.put('/action/assign-engineer', assignIssue);

// router.delete('/deleteIssue/:id', protectKey, deleteIssue);

module.exports = router;
