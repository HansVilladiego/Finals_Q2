import axios from "axios";
import type { Todo } from "../types/todo";

const BASE_URL = "http://localhost:5228/api/todo";

export const getAll = () =>
  axios.get<Todo[]>(BASE_URL).then(res => res.data);

export const create = (title: string) =>
  axios.post<Todo>(BASE_URL, { title, isCompleted: false }).then(res => res.data);

export const update = (id: number, data: Partial<Todo>) =>
  axios.put<Todo>(`${BASE_URL}/${id}`, data).then(res => res.data);

export const remove = (id: number) =>
  axios.delete(`${BASE_URL}/${id}`);

export const clearCompleted = (ids: number[]) =>
  Promise.all(ids.map(id => axios.delete(`${BASE_URL}/${id}`)));

export const verifyChain = () =>
  axios.get<{ status: string; message: string }>("http://localhost:5228/api/todo/verify")
    .then(res => res.data)
    .catch(err => {
      // 409 Conflict means tampered
      if (err.response?.status === 409) return err.response.data;
      throw err;
    });