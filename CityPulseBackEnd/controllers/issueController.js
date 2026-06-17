const issue = require('../models/Issues');

const createIssue = async (req, res) => {
    const {title, description, location, severity} = req.body;

    try{
        const NewIssue = new issue({
            title,
            description,
            location,
            severity,
            reportedBy: req.user._id
        })

        const savedIssue = await NewIssue.save();
        
        console.log('--------------------');
        console.log('Issue created successfully');
        console.log('--------------------');        
        console.log('Issue details:',
        {
            title: savedIssue.title,
            description: savedIssue.description,
            location: savedIssue.location,
            severity: savedIssue.severity,
            status: savedIssue.status
        });
        console.log('--------------------');

        console.log('user who make the report:',
            `name: ${req.user.name}`, 
            `email: ${req.user.email}`,
            `role: ${req.user.role}`
        );


        return res.status(201).json({ message: 'Issue created successfully', issue: savedIssue });
    }


        catch(error){
        console.error('Error creating issue:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
        
    }

    const getAllIssues = async (req, res) => {
        try{
            const issues = await issue.find().populate('reportedBy', 'name email').populate('assignedTo', 'name email');
            return res.status(200).json(issues);    
        } catch (error) {
            console.error('Error fetching issues:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    module.exports = { createIssue, getAllIssues };