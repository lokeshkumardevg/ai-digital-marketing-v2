// src/store/hooks.ts
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './index';

/** Typed dispatch hook */
export const useAppDispatch = () => useDispatch<AppDispatch>();
/** Typed selector hook */
export const useAppSelector = <TSelected>(selector: (state: RootState) => TSelected) => useSelector(selector);
