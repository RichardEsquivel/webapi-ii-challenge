const express = require('express');
//import functions from db.js to utilize
const db = require('../data/db.js');
const router = express.Router();

router.get('/', (req, res) => {
	db.find()
		.then(posts => res.status(200).json(posts))
		.catch(error => {
			console.log(error);
			res.status(500).json({ error: "The posts information could not be retrieved." })
		});
})

//get specific post utilize findById
router.get('/:id', (req, res) => {
	//destructure id out of req.params
	const { id } = req.params;
	db.findById(id)
		.then(posts => {
			//console log for error checking
			//1st element of empty array is undefined for 404
			const post = posts[0];
			console.log(post);
			if (post) {
				res.status(200).json(post);
			}
			else {
				res.status(404).json({ error: "The post with the specified id does not exist." })
			}
		});
});

//
router.post('/', (req, res) => {
	//destructure title and contents from the body
	const { title, contents } = req.body
	//If there is not title or contents we'll throw a 400 error
	if (!title || !contents) {
		//Return causes this to end and escape function 
		return res.status(400).json({ error: "Please provide title and contents for the post." });
	}

	//utilize db.insert to posts contents and title 
	db.insert({ title, contents })
		//destructure id so we can return post to user using this id
		.then(({ id }) => {
			db.findById(id)
				//return the array of that post
				.then(([post]) => {
					//Return status of 201 created and the created post
					res.status(201).json(post);
				})
		})
		.catch(error => {
			console.log(error)
			res.status(500).json({ error: "There was an error while saving the post to the database." })
		})
})

//Build delete endpoint utilizing db.remove
router.delete('/:id', (req, res) => {
	const { id } = req.params;
	db.findById(id)
		.then(post => {
			if (post[0]) {
				res.status(200).json({ post })
				db.remove(id)
					.catch(error => res.status(500).json({ error: "The post could not be removed." }))
			}
			else {
				res.status(404).json({ message: "the post with the specified ID does not exist." })
			}
		})

});

router.put('/:id', (req, res) => {
	const { id } = req.params;
	//destructure title and contents from the body
	const { title, contents } = req.body
	//If there is not title or contents we'll throw a 400 error
	if (!title && !contents) {
		//Return causes this to end and escape function 
		return res.status(400).json({ error: "Please provide title and contents for the post." });
	}
	//utilize db.update to update contents and title, we need the object to pass in for the update of title, contents and the id to update the contents of "function update(id, post)"
	db.update(id, { title, contents })
		//destructure id so we can return post to user using this id
		.then(updates => {
			if (updates) {
				db.findById(id)
					//return the array of that post
					.then(([post]) => {
						//Return status of 201 created and the created post
						res.status(200).json(post);
					})
			} else {
				res.status(404).json({ error: "The post with the specified ID does not exist." })
			}
		})

		.catch(error => {
			console.log(error)
			res.status(500).json({ error: "The post information could not be modified." })
		})
})

router.post("/:id/comments", (req, res) => {
	const { post_id } = req.params;
	// Check if the value for text is a truthy value
	if (!req.body.text) {
		res.status(400).json({ error: "Please provide text for the comment." })
	}
	// Locate the post by the id value
	db.findById(post_id)
		.then(post => {
			console.log(post)
			// If post.id is a truthy value
			if (post) {
				db.insertComment(req.body)
					.then(commentsId => {
						db.findCommentById(commentsId.id)
							.then(addedComment => {
								res.status(201).json({ data: addedComment });
							})
					})//throw an error 500 if there is an error
					.catch(error => {
						res.status(500).json({ error: "There was an error while saving the comment to the database." })
					})
				//if unable to locate that post id
			} else {
				res.status(404).json({ error: "The post for the specified ID does not exist." })
			}
		})
})

// .then(([post]) => {
// 	console.log(post);
// 	if (post.length > 0) {
// 		db.insertComment(post_id)
// 			.then(commentsId => {
// 				db.findCommentById(post_id)
// 					.then(addedComment => {
// 						res.status(201).json({ data: addedComment });
// 					})
// 			})
// 			.catch(error => {
// 				console.log(error);
// 				res.status(500).json({ error: "There was an error while saving the comment to the database." })
// 			})
// 	} else {
// 		res.status(404).json({ error: "The post for the specified ID does not exist." })
// 	}
// })




router.get('/:post_id/comments', (req, res) => {
	const { post_id } = req.params;
	db.findById(post_id)
		.then(([post]) => {
			if (post) {
				db.findPostComments(post_id).then(comments => {
					if (!comments.length) {
						return res.status(404).json({ message: "There are no comments!" })
					}
					return res.status(200).json(comments);
				}


				)
			} else {
				res.status(404).json({ error: "The post with the specified ID does not exist." });
			}
		})
		.catch(error => {
			console.log(error);
			res.status(500).json({ error: "The comments information could not be retrieved." });
		});
});


module.exports = router;