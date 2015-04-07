'use strict';

define('hover-trigger', ['jquery'], function($) {
    var hoverTrigger = {
        on: function(body, selector, getURL) {
            body = $(body);
            body.on('mousedown', selector, function(e) {
                if (e.which !== 1) {
                    return;
                }
                var link = $(this);
                var timeout = setTimeout(function() {
                    chrome.runtime.sendMessage({ msg: 'activate', url: getURL(link) });
                    link.css('pointer-events', 'none');
                    link.css('cursor', 'default');
                    var interval = setInterval(function() {
                        if (hoverTrigger.isActive(link)) {
                            return;
                        }
                        link.css('pointer-events', '');
                        link.css('cursor', 'auto');
                        clearInterval(interval);
                    }, 100);
                }, 333);
                link.one('mouseleave', function mouseleave() {
                    clearTimeout(timeout);
                });
                link.one('click', function click() {
                    if (e.which !== 1) {
                        return;
                    }
                    clearTimeout(timeout);
                });
            });
        },
        isActive: function(obj) {
            return obj.is(':active');
        }
    };

    return hoverTrigger;
});
