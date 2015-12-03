var _       = require('underscore');
var Ractive = require('ractive');
var config  = require('../config');
var service = require('../service');
var urls    = require('hovercardsshared/urls');
require('../common/mixins');

Ractive.DEBUG = process.env.NODE_ENV !== 'production';

Ractive.prototype.observeUntil = function(keypath, handler) {
	if (this.get(keypath)) {
		handler(this.get(keypath));
	} else {
		this.observeOnce(keypath, handler);
	}
};

Ractive.prototype.service = function(keypath, identity, handler) {
	var ractive = this;
	var val     = ractive.get(keypath);
	if (val && (val.loading || val.loaded)) {
		return;
	}
	ractive.set(keypath + '.loading', true);
	ractive.set(keypath + '.loaded',  false);
	service(identity || val, function(err, data) {
		if (err) {
			ractive.set(keypath + '.err',    err);
			ractive.set(keypath + '.loaded', true);
			return (handler || _.noop)(ractive.get(keypath + '.err'));
		}
		ractive.set(keypath, _.extend(data, { loaded: true }));
		(handler || _.noop)(null, ractive.get(keypath));
	});
};

var global_data = {
	_: _,
	copy: function(name, api) {
		var rest = _.rest(arguments, 2);
		name = name.replace(/\-/g, '_');
		return (!_.isEmpty(api) && chrome.i18n.getMessage(api + '_' + name, rest)) || chrome.i18n.getMessage(name, rest);
	},
	prefix: _.prefix,
	url: urls.print
};

var HoverCardRactive = Ractive.extend({
	data:       global_data,
	partials:   _.chain(require('../../node_modules/hovercardsshared/*/@(content|discussion|discussion-header|account|account-content).html', { mode: 'hash' }))
	             .extend(require('../../node_modules/hovercardsshared/@(content|discussion|discussion-header|account|account-content)/layout.html', { mode: 'hash' }))
	             .reduce(function(memo, template, key) {
	                 memo[key.replace('/', '-')] = template;
	                 return memo;
	             }, {})
	             .value(),
	components: _.chain(require('../../node_modules/hovercardsshared/*/*.ract', { mode: 'hash' }))
	             .extend(require('../../node_modules/hovercardsshared/common/*.ract', { mode: 'hash' }))
	             .reduce(function(memo, obj, key) {
	                 obj.data = _.extend(obj.data || {}, global_data);
	                 var key_parts = key.split(/[/-]/g);
	                 while (key_parts[0] && _.isEqual(key_parts[0], key_parts[1])) {
	                     key_parts.shift();
	                 }
	                 memo[key_parts.join('-')] = Ractive.extend(obj);
	                 return memo;
	             }, {})
	             .value(),
	decorators:  _.chain(require('../../node_modules/hovercardsshared/common/*-decorator.js', { mode: 'hash' }))
	              .reduce(function(memo, template, key) {
	                  memo[key.replace(/-decorator$/, '')] = template;
	                  return memo;
	              }, {})
	              .value()
});

module.exports = function(obj, identity, expanded) {
	var ractive = obj.data('ractive');

	if (!ractive) {
		ractive = new HoverCardRactive({
			template: '{{>type+"-layout"}}',
			data:     identity,
			el:       obj
		});
		obj.data('ractive', ractive);

		ractive.service(identity.type, identity, function(err, data) {
			if (err) {
				return;
			}
			switch (data.type) {
				case 'content':
					var given_discussions = _.each(data.discussions, _.partial(_.extend, _, { loaded: true })) || [];
					delete data.discussions;
					var default_discussions = _.chain(config.apis[data.api])
					                           .result('discussion_apis', [])
					                           .map(function(api) {
					                               return (api === data.api) ? _.defaults({ type: 'discussion', loaded: false }, data) :
					                                                           { api: api, type: 'discussion', for: _.clone(data), loaded: false };
					                           })
					                           .value();
					ractive.set('discussions', _.chain(given_discussions)
					                            .union(default_discussions)
					                            .uniq(_.property('api'))
					                            .reject(_.property('hide'))
					                            .value());
					ractive.set('discussion_i', 0);
					ractive.observeUntil('expanded', function() {
						ractive.observe('discussion_i', function(i) {
							ractive.service('discussions.' + i);
						});
					});
					break;
				case 'account':
					ractive.set('account_content', data.content ? _.extend(data.content, { loaded: true }) :
					                                              _.defaults({ type: 'account_content', loaded: false }, data));
					ractive.observeUntil('expanded', function() {
						ractive.observeUntil('account_content', function(account_content) {
							ractive.service('account_content', account_content);
						});
					});
					break;
			}
		});
	}

	ractive.set('expanded', expanded);

	return ractive;
};
