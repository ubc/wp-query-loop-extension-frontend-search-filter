/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */

import { useInstanceId } from '@wordpress/compose';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { Fragment } from '@wordpress/element';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @param {Object}   props               Properties passed to the function.
 * @param {Object}   props.attributes    Available block attributes.
 * @param {Function} props.setAttributes Function that updates individual attributes.
 *
 * @return {Element} Element to render.
 */
export default function Edit( { attributes, setAttributes } ) {
	const blockProps = useBlockProps();
	const { instanceId, label, accessibleLabel } = attributes;
	const newInstanceId = useInstanceId( Edit );

	if ( null === instanceId ) {
		setAttributes( { instanceId: newInstanceId } );
	}

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody title="Settings" initialOpen={ true }>
					<TextControl
						label="Placeholder"
						value={ label }
						onChange={ ( newLabel ) => {
							setAttributes( {
								label: newLabel
							} )
						} }
					/>
					<TextControl
						label="Accessible Label"
						value={ accessibleLabel }
						onChange={ ( newAccessibleLabel ) => {
							setAttributes( {
								accessibleLabel: newAccessibleLabel
							} )
						} }
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<div className="wp-query-filter__search-wrapper">
					<input
						type="search"
						className='wp-query-filter__search'
						placeholder={ label }
						role="search"
						inputmode="search"
						autocomplete="off"
					/>
				</div>
			</div>
		</Fragment>
	);
}
