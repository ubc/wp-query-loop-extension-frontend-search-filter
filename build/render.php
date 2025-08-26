<?php
/**
 * PHP file to use when rendering the block type on the server to show on the front end.
 *
 * The following variables are exposed to the file:
 *     $attributes (array): The block attributes.
 *     $content (string): The block default content.
 *     $block (WP_Block): The block instance.
 *
 * @see https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-metadata.md#render
 * @package query-taxonomy-filters
 */

$label         = $attributes['label'];
$identifier    = 'query-' . $block->context['queryId'] . '-search-' . $attributes['instanceId'];
$search_string = isset( $_GET[ $identifier ] ) && ! empty( $_GET[ $identifier ] ) ? sanitize_text_field( $_GET[ $identifier ] ) : '';

$conext = array(
	'search' => $search_string,
	'lock'   => null,
);
?>
<div
	<?php echo get_block_wrapper_attributes(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> 
	data-wp-interactive="ctlt-query-search-filter"
	data-wp-watch="callbacks.navigateToDestination"
	filter-id="<?php echo esc_attr( $attributes['instanceId'] ); ?>"
	<?php echo wp_interactivity_data_wp_context( $conext ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> 
>
	<div class="wp-query-filter__search-wrapper">
		<input
			type="search"
			placeholder="<?php echo esc_attr( $label ); ?>"
			data-wp-on--input="actions.onChangeSearch"
			data-wp-bind--value="context.search"
			class="wp-query-filter__search"
			role="search"
			inputmode="search"
			autocomplete="off"
		/>
		<div
			class="spinner"
			data-wp-bind--hidden="!context.lock"
		></div>
	</div>
</div>
