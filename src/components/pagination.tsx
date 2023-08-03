import { prependOnceListener } from 'process';
import * as React from 'react';
import styled from 'styled-components';

// add pagination buttons
// show 5 in each direction,
// cursor + 1 = 9 in
// |< 0 | 6 7 8 (9) 10 11 12 | 20 30 40 >|
export interface PaginationProps {
	value: number | null;
	max: number;
	onChange: (count: number) => void;
}

const StyledOl = styled.ol`
	list-style: none;
	padding-left: 0px !important;
	display: flex;
	gap: 0.25rem;
`;

export const Pagination = (props: PaginationProps) => {
	const current = props.value;
	const start = 0;
	const end = props.max;
	const nexts = [1, 2, 3]
		.map((count) => (current ?? start) + count)
		.filter((next) => next < end);
	const prevs = [3, 2, 1]
		.map((count) => (current ?? start) - count)
		.filter((next) => next > start);
	const all = [
		start,
		...prevs,
		current === start || current === end ? null : current,
		...nexts,
		end,
	].filter((nullable): nullable is number => nullable != null);

	return (
		<nav role="navigation">
			<StyledOl>
				{all.map((number) => (
					<PaginationItem
						onClick={props.onChange}
						page={number}
						current={current == number}
					/>
				))}
			</StyledOl>
		</nav>
	);
};
const StyledButton = styled.button<{ active?: boolean }>`
	background-color: ${(props) =>
		props.active
			? props.theme.color.semantic.background.modifier.hover.normal
			: props.theme.color.semantic.background.primary.above} !important;
`;

const PaginationItem = (props: {
	page: number;
	current: boolean;
	onClick: (page: number) => void;
}) => (
	<li>
		<StyledButton
			active={props.current}
			onClick={() => props.onClick(props.page)}
			aria-label={`${props.current ? `Current page, ` : ''}Page ${
				props.page
			}`}
			aria-current={props.current}
		>
			{props.page}
		</StyledButton>
	</li>
);
