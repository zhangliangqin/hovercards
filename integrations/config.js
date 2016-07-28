module.exports = {
	counts: {
		grid:   21,
		listed: 30
	},
	integrations: {
		imgur: {
			content_security_policy: {
				'img-src':   ['http://i.imgur.com'],
				'media-src': ['http://i.imgur.com']
			},
			discussion_integrations: ['reddit', 'imgur', 'twitter']
		},
		instagram: {
			content_security_policy: {
				'img-src':   ['https://scontent.cdninstagram.com'],
				'media-src': ['https://scontent.cdninstagram.com']
			},
			authenticatable:         true,
			authentication_url:      'https://instagram.com/oauth/authorize/?scope=basic+public_content&client_id=' + process.env.INSTAGRAM_CLIENT_ID + '&redirect_uri=https://EXTENSION_ID.chromiumapp.org/callback&response_type=token', // FIXME Use chrome.i18n.getMessage('@@extension_id')
			discussion_integrations: ['instagram', 'reddit', 'twitter'],
			environment:             'client'
		},
		reddit: {
			discussion_integrations: ['reddit', 'twitter'],
			environment:             'client'
		},
		soundcloud: {
			content_security_policy: {
				'img-src':   ['https://i1.sndcdn.com'],
				'frame-src': ['https://w.soundcloud.com']
			},
			discussion_integrations: ['reddit', 'soundcloud', 'twitter'],
			environment:             'client'
		},
		twitter: {
			authenticatable:         true,
			discussion_integrations: ['reddit', 'twitter']
		},
		youtube: {
			content_security_policy: {
				'img-src':    ['https://yt3.ggpht.com', 'https://*.googleusercontent.com'],
				'script-src': ['https://s.ytimg.com']
			},
			cache_length:            360000,
			discussion_integrations: ['reddit', 'youtube', 'twitter']
		}
	}
};
