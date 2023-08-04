import { Pagination } from '@mui/material';
import React from 'react';
import styled from 'styled-components';

const StyledButtons = styled.div`
	display: flex;
	gap: 1rem;
`;

const StyledContainer = styled.div`
	display: flex;
	justify-content: space-between;
`;

export interface ControlPanelProps {
	newMode: boolean;
	count: number | undefined;
	onToggleMode?: () => void;
	onClear?: () => void;
	onPageChange?: (event: React.ChangeEvent<unknown>, page: number) => void;
	page: number | undefined;
}

export const ControlPanel = ({
	onToggleMode,
	newMode,
	onClear,
	page,
	count,
	onPageChange,
}: ControlPanelProps) => {
	return (
		<StyledContainer>
			<StyledButtons>
				<button onClick={() => onToggleMode?.()}>
					{!newMode ? 'Create' : 'Back to item'}
				</button>
				<button onClick={() => onClear?.()}>Clear</button>
			</StyledButtons>
			<Pagination
				showFirstButton
				showLastButton
				count={count}
				page={page}
				onChange={onPageChange}
			/>
		</StyledContainer>
	);
};
