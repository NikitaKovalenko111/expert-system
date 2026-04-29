import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import { rootSaga } from './saga/saga'

const sagaMiddleware = createSagaMiddleware()

export const store = configureStore({
	reducer: {},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			thunk: false,
			serializableCheck: false,
		}).concat(sagaMiddleware),
})

sagaMiddleware.run(rootSaga)

export type AppStore = typeof store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
