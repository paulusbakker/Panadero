import styled from "styled-components";
import {Link} from 'react-router-dom'

export const ItemHeaderStyled = styled.div`
  display: flex;
  justify-content: space-between;
  position: relative;
  align-items: center;
  //margin-right: -7px;
  font-size: 25px;
`;

export const ContentUlStyled = styled.ul`
  box-shadow: ${(props) => props.theme.boxShadow.default};
  font-family: ${(props) => props.theme.fonts.secondary};
  margin: ${(props) => props.theme.margins.marginTop} 10px 8px 8px;
  font-size: 18px;
  background-color: ${(props) => props.theme.colors.contentBackgroundColor};
`;







