var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var UserSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		trim: true
	},
	name: {
		type: String,
		required: true,
		trim: true
	},
	favoriteBook: {
		type: String,
		required: true,
		trim: true
	},
	password: {
		type: String,
		required: true
	}
});

// authenticate input against database documents
// the statics object lets you add methods directly to the model, allowing you to call this method in other files (e.g. routes)
UserSchema.statics.authenticate = function (email, password, callback){
	User.findOne({ email: email })
			.exec(function (err, user){
				// exec method performs the search and provides a callback to process the results
				if (err) {
					return callback(err);
				} else if (!user) {
					// if email address wasn't in any document, return err
					var err = new Error('User not found.');
					err.status = 401;
					return callback(err);
				}
				// if no errors, use .compare to compare supplied pass with hashed ver.
				bcrypt.compare(password, user.password, function (err, result){
					// comapre takes 3 args: plaintext pass, hashed pass, callback
					// result is a boolean
					if (result) {
						return callback(null, user);
						// the null above is for errors (following standard node pattern of err, followed by other args.
						// In this successful case, there was no error, so a null value is appropriate.)
					} else {
						return callback();
					}
				});
			});
}
// Mongoose offers a pre-save hook: essentially, a function
// that runs before saving a record to Mongo
// hash password before saving to database.
// call pre method on our schema, 2 params: hook name, function 
// In this case hook name is save, which is a special Mongoose keyword
// This is run before saving the record
// next represents the next function, which in this case is saving the record to mongo
// 'this' is assigned the database object Mongoose is about to insert into Mongo
UserSchema.pre('save', function (next) {
	var user = this;
	// .hash() runs hash & salt in one call
	// hash takes 3 args: plaintext pass, num, callback (called after hash gen)
	// num tells bcrypt how many times to apply the encryption algorithm
	// Bigger numbers, more security, slower to gen
	bcrypt.hash(user.password, 10, function(err, hash) {
		if (err) {
			return next(err);
		}
		user.password = hash;
		next();	// calling next calls the next function in the middleware stack - in this case, mongoose will save the data to mongo
	});
});

var User = mongoose.model('User', UserSchema);
module.exports = User;