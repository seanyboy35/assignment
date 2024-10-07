router.post('/requestJoin', (req, res) => {
    const { username, groupName } = req.body;
    
    // Log received request for debugging
    console.log(`Received join request from ${username} for group ${groupName}`);

    // Find the group in the database and add the join request
    // Assuming you have a Group model set up
    Group.findOne({ name: groupName })
        .then(group => {
            if (!group) {
                return res.status(404).send('Group not found');
            }
            // Add the request to the group
            group.requests.push(username);
            return group.save();
        })
        .then(() => res.status(200).send('Join request sent'))
        .catch(error => {
            console.error('Error handling join request:', error);
            res.status(500).send('Server error');
        });
});