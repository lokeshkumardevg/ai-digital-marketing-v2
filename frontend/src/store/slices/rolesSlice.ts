import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axios';

export const fetchRoles = createAsyncThunk('roles/fetchRoles', async (workspaceId?: string) => {
  const response = await api.get(`/roles?workspaceId=${workspaceId || ''}`);
  return response.data.data;
});

export const createRole = createAsyncThunk('roles/createRole', async (dto: any) => {
  const response = await api.post('/roles', dto);
  return response.data.data;
});

export const updateRole = createAsyncThunk('roles/updateRole', async ({ id, dto }: any) => {
  const response = await api.put(`/roles/${id}`, dto);
  return response.data.data;
});

export const deleteRole = createAsyncThunk('roles/deleteRole', async (id: string) => {
  await api.delete(`/roles/${id}`);
  return id;
});

interface RoleState {
  roles: any[];
  loading: boolean;
}

const initialState: RoleState = {
  roles: [],
  loading: false
};

const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => { state.loading = true; })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.roles.push(action.payload);
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.roles = state.roles.map((r: any) => r._id === action.payload._id ? action.payload : r);
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.roles = state.roles.filter((r: any) => r._id !== action.payload);
      });
  }
});

export const rolesReducer = rolesSlice.reducer;
