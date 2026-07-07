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

	if ( ! liveRegion ) {
		return;
	}

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

			// Hide the existing results as soon as the user starts typing,
			// while the debounce spinner is showing.
			const queryRef = event.target.closest(
				'.wp-block-query[data-wp-router-region]'
			);
			if ( queryRef ) {
				queryRef.classList.add( 'is-loading-content' );
				queryRef.setAttribute( 'aria-busy', 'true' );
			}

			context.lock = setTimeout(
                () => {
					// If the value reverted to the current search, no navigation
					// will happen — restore the hidden results.
					if ( event.target.value === context.search && queryRef ) {
						queryRef.classList.remove( 'is-loading-content' );
						queryRef.removeAttribute( 'aria-busy' );
					}
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

			// Dim the existing results while the new content loads.
			queryRef.classList.add( 'is-loading-content' );
			queryRef.setAttribute( 'aria-busy', 'true' );

			try {
				yield actions.navigate( navigateTo );
			} finally {
				queryRef.classList.remove( 'is-loading-content' );
				queryRef.removeAttribute( 'aria-busy' );
			}

			updateLiveRegion(ref);
		},
	  },
	
} );
