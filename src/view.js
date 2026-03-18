/**
 * WordPress dependencies
 */
import { store, getContext, getElement, withScope, useEffect } from '@wordpress/interactivity';

let didRunInitially = false;

const updateURLParameter = ( url, urlParameters ) => {
	const newUrl = new URL(url);

	urlParameters.forEach( urlParameter => {
		newUrl.searchParams.set(urlParameter.identifier, urlParameter.value);
	});

	return newUrl;
};

const updateLiveRegion = ( element ) => {
	const liveRegion = element.querySelector( '.live-region' );
	
	// Screen readers often suppress announcements if the new text is identical to the old text.
	// We alternate by adding a non-breaking space at the end to force a perceived change.
	if ( liveRegion.textContent === "Content updated." ) {
		liveRegion.textContent = "Content updated.\u00A0";
	} else {
		liveRegion.textContent = "Content updated.";
	}
};

store( 'ctlt-query-search-filter', {
	actions: {
		onChangeSearch: ( event ) => {
			event.preventDefault();
			const context = getContext();
			// Don't navigate if the search didn't really change.
			if ( event.target.value === context.search ) return;
			clearTimeout( context.lock );

			context.lock = setTimeout(
                () => {
					context.search = event.target.value;
					context.lock = null;
				},
                2000
            );
		},
	},
	callbacks: {
		navigateToDestination: function* () {
			const { search } = getContext();
			const { ref } = getElement();

			if ( null === ref ) {
				return;
			}

			if ( ! didRunInitially ) {
				didRunInitially = true;
				return; // Skip the first run on node creation
			}
			
			const queryRef = ref.closest(
				'.wp-block-query[data-wp-router-region]'
				);

			const { actions } = yield import(
				'@wordpress/interactivity-router'
			);

			let navigateTo = updateURLParameter(
				window.location,
				[
					{ identifier: queryRef.getAttribute( 'data-wp-router-region' ) + '-search-' + ref.getAttribute( 'filter-id' ), value: search },
					{ identifier: queryRef.getAttribute( 'data-wp-router-region' ) + '-page', value: '1' },
				]
			);

			yield actions.navigate( navigateTo );	

			updateLiveRegion(ref);
		},
	  },
	
} );
