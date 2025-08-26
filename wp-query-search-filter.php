<?php
/**
 * Plugin Name:       WP Query Block Extension - Frontend Search Filter
 * Description:       Add search filter in the frontend page that filters the posts returned from the query block.
 * Version:           0.1.1
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Author:            CTLT WordPress
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       query-search-filter
 *
 * @package           query-search-filter
 */

namespace UBC\CTLT\BLOCKS\QUERY_BLOCK\FILTERS\SEARCH;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

add_action( 'init', __NAMESPACE__ . '\\init' );
add_filter( 'pre_render_block', __NAMESPACE__ . '\\pre_render_block', 10, 2 );

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function init() {
	register_block_type_from_metadata( __DIR__ . '/build' );
}

/**
 * Inject new tax query from the filter based on query ID.
 *
 * @param string|null $pre_render The pre-rendered content. Default null.
 * @param array       $parsed_block The block being rendered.
 *
 * @return string|null The modified pre-rendered block content or the original pre-rendered content if the block name is not 'core/query'.
 */
function pre_render_block( $pre_render, $parsed_block ) {
	if ( 'core/query' !== $parsed_block['blockName'] ) {
		return $pre_render;
	}

	$is_interactive = isset( $parsed_block['attrs']['enhancedPagination'] )
		&& true === $parsed_block['attrs']['enhancedPagination']
		&& isset( $parsed_block['attrs']['queryId'] );

	if ( ! $is_interactive ) {
		return $pre_render;
	}

	add_filter(
		'query_loop_block_query_vars',
		function ( $query, $block ) {
			$query_id            = $block->context['queryId'];
			$identifier = 'query-' . $query_id . '-search-';

			foreach ( $_GET as $key => $value ) {
				if ( preg_match( '/^' . $identifier . '(\d+)$/', $key, $matches ) && ! empty( $value ) ) {
					$query['s'] = sanitize_text_field( $value );
					break;
				}
			}

			return $query;
		},
		10,
		2
	);

	return $pre_render;
}
