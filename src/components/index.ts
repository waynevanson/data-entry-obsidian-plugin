import styled from 'styled-components';

export const Button = styled.button`
	border-radius: var(--button-radius);
	background-color: var(--interactive-normal);

	&:hover {
		background-color: var(--interactive-hover);
	}
`;
