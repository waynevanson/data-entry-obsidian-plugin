import { Pagination, Unstable_Grid2 as Grid } from '@mui/material';
import React from 'react';
import styled from 'styled-components';

const StyledButtons = styled.div`
  display: flex;
  gap: 1rem;
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
    <Grid
      container
      justifyContent="space-between"
      alignItems="center"
      justifyItems="stretch"
    >
      <Grid>
        <StyledButtons>
          <button onClick={() => onToggleMode?.()}>
            {!newMode ? 'Create ->' : '<- Back to item'}
          </button>
          <button onClick={() => onClear?.()}>Clear</button>
        </StyledButtons>
      </Grid>
      {!newMode && (
        <Grid>
          <Pagination
            sx={{ ul: { paddingLeft: 0 }, button: { borderRadius: '8px' } }}
            siblingCount={0}
            boundaryCount={0}
            count={count}
            page={page}
            disabled={newMode}
            onChange={onPageChange}
          />
        </Grid>
      )}
    </Grid>
  );
};
