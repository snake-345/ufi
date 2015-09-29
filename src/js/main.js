(function($) {
	'use strict';

	$('.content .items').ufiScroll({
		selectors: {
			items: '.item'
		}
	});

	//$('.content .row').ufiScroll({
	//	url: window.location.pathname +
	//		window.location.search +
	//		(window.location.search ? '&page={number}' : '?page={number}') +
	//		window.location.hash,
	//	preloader: '<div class="preloader">Loading...</div>',
	//	selectors: {
	//		itemFirst: '.ufi-item-first',
	//		itemLast: '.ufi-item-last'
	//	}
	//});
}(jQuery));