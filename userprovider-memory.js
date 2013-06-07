UserProvider = function(){};
UserProvider.prototype.dummyData = [];

UserProvider.prototype.findByUsername = function (username, callback) {
	var user = null;
	for (var index = 0; index < this.dummyData.length; index++) {
		if (this.dummyData[index].username == username) {
			user = this.dummyData[index];
		}
	}
	callback(null, user);
};

UserProvider.prototype.save = function (users, callback) {
	var user = null;
	if (typeof(users.length) == "undefined")
		users = [users];
	for (var index = 0; index < users.length; index++) {
		user = users[index];
		this.dummyData[this.dummyData.length] = user;
	}
	callback(null, users);
};

new UserProvider().save([ { username: 'emptyset', password: 't3mp' } ], function (error, users) {});
exports.UserProvider = UserProvider;
