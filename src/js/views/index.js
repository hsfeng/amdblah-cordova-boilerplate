define(['jquery', 'underscore', 'backbone', 'hbs!templates/welcome'], function(
	$, _, Backbone, welcomeTmpl) {
	'use strict';

	var IndexView = Backbone.Marionette.ItemView.extend({

		template: welcomeTmpl,

		events: {

		},

		onShow: function() {
			console.log('index view is showing.');
			this.bindEvents();
		},

		serializeData: function() {
			return {
				renderTime: new Date().getTime()
			};
		},
		// Bind Event Listeners
		//
		// Bind any events that are required on startup. Common events are:
		// 'load', 'deviceready', 'offline', and 'online'.
		bindEvents: function() {
			var self = this,
				isCordovaApp = !!window.cordova;
			if (isCordovaApp) {
				document.addEventListener('deviceready', function() {
					self.onDeviceReady();
				}, false);
			} else {
				this.receivedEvent('deviceready');
			}
		},
		// deviceready Event Handler
		//
		// The scope of 'this' is the event. In order to call the 'receivedEvent'
		// function, we must explicity call 'app.receivedEvent(...);'
		onDeviceReady: function() {
			this.receivedEvent('deviceready');
		},
		// Update DOM on a Received Event
		receivedEvent: function(id) {
			var parentElement = document.getElementById(id);
			var listeningElement = parentElement.querySelector('.listening');
			var receivedElement = parentElement.querySelector('.received');

			listeningElement.setAttribute('style', 'display:none;');
			receivedElement.setAttribute('style', 'display:block;');

			console.log('Received Event: ' + id);
		}
	});

	return IndexView;
});
