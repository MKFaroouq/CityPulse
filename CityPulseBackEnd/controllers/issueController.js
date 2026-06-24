const issue = require('../models/Issues');
const User = require('../models/Users');

const createIssue = async (req, res) => {
    const {title, description, location, severity, latitude, longitude} = req.body;

    // for testing purposes only, to see the incoming data in the console
    console.log("=== Incoming Request Data ===");
    console.log("req.body:", req.body); // show undefined
    console.log("req.file:", req.file); // not appearing 
    console.log("=============================");

    try{
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const NewIssue = new issue({
            title,
            description,
            location,
            severity,
            image: imageUrl,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
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
            status: savedIssue.status,
            image: savedIssue.image,
            latitude: savedIssue.latitude,
            longitude: savedIssue.longitude,
            reportedBy: savedIssue.reportedBy,
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
            console.log('--------------------');
            console.log('All issues fetched successfully');
            console.log('--------------------');
            console.log('Issues details:', issues);
            console.log('--------------------');

            // Check if the user is an admin, if yes return all issues, if not return only the issues reported by the user
            if ( req.user.role === 'admin') {
                const allIssues = await issue.find().sort({ createdAt: -1 }).populate('reportedBy', 'name email').populate('assignedTo', 'name email');
                console.log('--------------------');
                console.log('All issues fetched successfully for admin');
                console.log('--------------------');
                console.log('Issues details for admin:', allIssues);
                console.log('--------------------');
                console.log('--------------------');
                return res.status(200).json({ message: 'all issues fetched successfully', issues: allIssues });
            }

            // if the user is an engineer, return only the issues in the same sector of the engineer and the issues that assigned to the engineer and all issues in the same sector of the engineer even if not assigned to the engineer
            if ( req.user.role === 'engineer') {
                const assignIssues = await issue.find({assignedTo: req.user._id}).populate('reportedBy', 'name email').populate('assignedTo', 'name email').sort({ createdAt: -1 });
                console.log('--------------------');
                console.log(`Engineer Assign To Issues`);
                console.log(`Engineer ${req.user.name} fetched issues that assign to successfully`);
                console.log('--------------------');
                console.log('Issues details for engineer:', assignIssues);
                console.log('--------------------');
                console.log('--------------------');

                // also fetching all issues 
                const allIssues = await issue.find().sort({ createdAt: -1 }).populate('reportedBy', 'name email').populate('assignedTo', 'name email');
                console.log('--------------------');
                console.log('All issues fetched successfully for admin');
                console.log('--------------------');
                console.log('Issues details for admin/engineer:', allIssues);
                console.log('--------------------');
                console.log('--------------------');


                return res.status(200).json({
                    message: 'all issues and that assigned to the engineer fetched successfully',
                    allIssues : allIssues,
                    assignIssues: assignIssues
                });            
            }

            // if the user is a citizen, return only the issues reported by the user
            if ( req.user.role === 'citizen') {
                const userIssues = await issue.find({ reportedBy:req.user._id }).populate('reportedBy', 'name email').populate('assignedTo', 'name email').sort({ createdAt: -1 });
                console.log('--------------------');
                console.log(`User ${req.user.name} fetched their issues successfully`);
                console.log('--------------------');
                console.log('User issues details:', userIssues);
                console.log('--------------------');
                return res.status(200).json({ message: 'User issues fetched successfully', issues: userIssues });
            }

               // if role => engineer return only the issues in the same sector of the engineer

                // if (req.user.role === 'engineer') {
                //     const engineerIssues = await Issue.find({ sector: req.user.sector });
                //     return res.status(200).json(engineerIssues);
    // }
            // Check if no issues found and return a 404 response
            if (!issues || issues.length === 0) {
                return res.status(404).json({ message: 'No issues found' });
            }
            return res.status(200).json(issues);    
        } catch (error) {
            console.error('Error fetching issues:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }

        
    };

// update issue status by id, only for engineers and admins
    const updateIssueStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // check if the status is valid or from the allowed enum values in the issue schema
        const allowedStatuses = ['Open', 'In-progress', 'Resolved'];
        if (!allowedStatuses.includes(status)) {
            console.log('Invalid status value:', allowedStatuses);
            return res.status(400).json({ message: 'not valid status - please select from : ' , allowedStatuses });
        }

        // check if the user is issue reporter, is the login user
        // if (issue.user.toString() !== req.user._id.toString()) {
        //     console.log('User is not the reporter of this issue, cannot update status');
        //     return res.status(403).json({ success: false, message: " cannot to update this issue it's not yours" });
        //     }        

        // if the status is open, return an error message that the status cannot be updated, only in-progress or resolved
            // if(issue.status === 'Open'){
            //     console.log('cannot update status of an open issue, only in-progress or resolved');
            //     return res.status(400).json({ message: 'cannot update status of an open issue, only in-progress or resolved' });
            // }



        // if ( allowedStatuses === 'open'){
        //     const deletedIssue = await issue.findByIdAndDelete(id);
        //     if (!deletedIssue) {
        //         return res.status(404).json({ message: 'Issue not found' });
        //     }
        // }
        
        // if (req.user.role === 'citizen') {
        //     return res.status(403).json({ message: 'Forbidden, only engineers and admins can update issue status' });
        // }

        // if the issue not found, return a 404 error
        const existingIssue = await issue.findById(id);
        if (!existingIssue) {
            console.log('Issue not found with id:', id);
            return res.status(404).json({ message: 'Issue not found' });
        }

        // check if the user is a citizen, if yes return a 403 error that only engineers and admins can update issue status
        if ( req.user.role === 'citizen') {
            console.log('Forbidden, only engineers and admins can update issue status');
            return res.status(403).json({ message: 'Forbidden, only engineers and admins can update issue status' });
        }

        if ( req.user.role === 'engineer') {
            // if the user is an engineer, check if the issue assigned to the engineer, if not return a 403 error that only engineers assigned to the issue can update issue status
            if (!existingIssue.assignedTo || existingIssue.assignedTo.toString() !== req.user._id.toString()) {
                console.log('Forbidden, only the assigned engineer can update issue status');
                return res.status(403).json({ message: 'Forbidden, only the assigned engineer can update issue status' });
            }
        }


        existingIssue.status = status;

        if (status === 'Resolved') {
            existingIssue.assignmentStatus = 'Assigned';
        }

        const updatedIssue = await existingIssue.save();

        console.log('--------------------');
        console.log('Issue status updated successfully');
        console.log('--------------------');
        console.log(`issue ${id} status updated to ${status} successfully`);
        console.log('--------------------');
        console.log('Updated issue details:', updatedIssue);
        console.log('--------------------');


        // update the issue status by id and return the updated issue
        // const updatedIssue = await issue.findByIdAndUpdate(
        //     id,
        //     { status: status },
        //     { new: true }
        // );



        return res.status(200).json({
            message: 'Issue status updated successfully',
            updatedIssue
        });

    } catch (error) {
        console.error('Error updating issue status:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};    

    // assign issue to engineer by id, only for admins
    // const assignIssue = async (req, res) => {
    //     try {
    //         const { issueId , engineerId } = req.body;

    //         // check if the user is admin
    //         // if (req.user.role !== 'admin') {
    //         //     return res.status(403).json({ message: 'Forbidden, only admins can assign issues' });
    //         // }

    //         const issue = await issue.findById(issueId);
    //         // check if the issue exists
    //         if(!issue){
    //             return res.status(404).json({ message: 'Issue not found' });
    //         }

    //         issue.assignedTo = engineerId;

    //         issue.assignmentStatus = 'Assigned';

    //         const updatedIssue = await issue.save();

    //         return res.status(200).json({
    //             message: 'Issue assigned successfully',
    //             updatedIssue
    //         });
    //     } catch (error) {
    //         console.error('Error assigning issue:', error);
    //         return res.status(500).json({ message: 'Internal server error' });
    //     }

    // }
    
    // check it not confimed function 
    const assignIssue = async (req, res) => {
    try {
        console.log('----  Received assign issue request ----:', req.body); 
        
        const { issueId, engineerEmail } = req.body;

        if (!issueId || !engineerEmail) {
            return res.status(400).json({ message: 'issueId and engineerEmail are required in the request body' });
        }


        // check if issue exists by id
        const existingIssue = await issue.findById(issueId);
        if (!existingIssue) {
            console.log('no issue found');
            return res.status(404).json({ message: "issue not found" });
        }


        // check if engineer exists by email and check if the user is an engineer
        const engineerUser = await User.findOne({ email: engineerEmail.toLowerCase().trim() });
        if (!engineerUser) {
            console.log('no engineer found with this email');
            return res.status(404).json({ message: 'no engineer found with this email' });
        }
        
        if (engineerUser.role !== 'engineer') {
            console.log('this user is not an engineer');
            return res.status(403).json({ message: 'not an engineer email' });
        }

        const updatedIssue = await issue.findByIdAndUpdate(
            issueId,
            {
                $set: {
                    assignedTo: engineerUser._id,
                    assignmentStatus: 'Assigned'
                }
            },
            { new: true, runValidators: false }
        ).populate('assignedTo', 'name email');

        console.log('Issue assigned successfully:', updatedIssue);

        return res.status(200).json({ 
            success: true, 
            message: "issue assigned successfully", 
            issue: updatedIssue 
        });

    } catch (error) {
        console.error("Error in assign Issue:", error);
        return res.status(500).json({ 
            message: "An error occurred", 
            error: error.message 
        });
    }
};

// delete issue by id, only for admins and the reporter of the issue
const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;


    // find the issue by id to check if it exists and to check if the user is the reporter of the issue.
    const deletedIssue = await Issue.findByIdAndDelete(id);

    if (!deletedIssue) {
        console.log('Issue not found for deletion');
      return res.status(404).json({ success: false, message: ' this issue does not exist' });
    }

    res.status(200).json({ success: true, message: ' this issue has been deleted successfully' });
    
  } catch (error) {
    console.error("Error in deleteIssue:", error);
    res.status(500).json({ success: false, message: 'An error occurred while deleting the issue' });
  }
};


// const assignIssue = async (req, res) => {
//     try {
//         console.log('----  Received assign issue request ----:', req.body); // Log the incoming request body
//         console.log('Assigned engineer ID:', req.body.engineerId);
//         console.log('Assigned issue ID:', req.body.issueId);

//         const { issueId, engineerEmail } = req.body;

//         // check if issue exists
//         const issue = await Issue.findById(issueId);
//         if (!issue) {
//             console.log('no issue found');
//             return res.status(404).json({ message: "issue not found" });
//         }

//         const engineerUser = await User.findOne({ email: user.email.toLowerCase().trim() });
//         if (!engineerUser) {
//             return res.status(404).json({ message: 'no engineer found' });
//         }
        
//         if (engineerUser.role !== 'engineer') {
//             return res.status(403).json({ message: ' not engineer role' });
//         }

//         // update the issue with the assigned engineer and change the assignment status to "Assigned"
//         issue.assignedTo = engineerUser.email; // Store the engineer's email in the issue document
//         issue.assignmentStatus = 'Assigned';

//         await issue.save();

//         const updatedIssue = await Issue.findById(issueId).populate('assignedTo', 'email');

//         res.status(200).json({ 
//             success: true, 
//             message: "issue assigned successfully", 
//             issue: updatedIssue 
//         });

//         console.log('Issue assigned successfully:', updatedIssue);
//         console.log('Assigned engineer email:', updatedIssue.assignedTo.email); 
//         console.log('Assigned engineer ID:', updatedIssue.assignedTo._id);

//     } catch (error) {
//         console.error("Error in assign Issue:", error);
//         res.status(500).json({ message: "An error occurred while assigning the issue" });
//     }
    
// };
 

module.exports = { createIssue, getAllIssues, updateIssueStatus, assignIssue , deleteIssue };