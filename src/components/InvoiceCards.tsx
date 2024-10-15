'use client';
import React, { useState, useEffect } from 'react';
import InvoiceCard from './InvoiceCard';
import Filter from './Filter';
import NoInvoice from './NoInvoice';
//import Loading from './Loading';
import { IInvoice } from './Types';

import {
  //useDispatch,
  useSelector,
} from 'react-redux';
//import { fetchInvoices } from '../app/redux/slices/invoicesSlice';
import NewInvoice from './NewInvoice';
//import { TypedUseSelectorHook } from 'react-redux';
import type {
  RootState,
  //, AppDispatch
} from '../app/redux/store';

export default function InvoiceCards() {
  const [isOpenMenu, setIsOpenMenu] = useState<boolean>(false);
  const [isOpenNewInvoice, setIsOpenNewInvoice] = useState<boolean>(false);

  // const dispatch = useDispatch<AppDispatch>();
  //const invoices = useSelector((state: RootState) => state.invoices.invoices);
  const edittedInvoices = useSelector(
    (state: RootState) => state.invoices.editedinvoices
  );

  /*const newInvoices = useSelector((state: RootState) => {
    console.log(state);
    return state.newInvoices.newInvoices;
  });*/

  const filters = useSelector((state: RootState) => state.filters.filters);
  /* const invoicesStatus = useSelector(
    (state: RootState) => state.invoices.status
  );*/
  //const error = useSelector((state) => state.invoices.error);

  /* const deletedId = useSelector(
    (state: RootState) => state.deletedId.deletedId
  );*/

  /*useEffect(() => {
    if (invoicesStatus === 'idle') {
      dispatch(fetchInvoices());
    }
  }, [dispatch, invoices, invoicesStatus]);*/

  const [invoicesToShow, setInvoicesToShow] = useState<IInvoice[] | null>([]);
  // DELETE NEW INVOICES???
  /* const invoicesWithoutDeleted = () => {
    const i = invoices;
    if (deletedId && deletedId.length > 0) {
      return i.filter((invoice: IInvoice) => !deletedId.includes(invoice.id));
    }
    return i;
  };*/
  /* const newInvoicesArray = [...invoicesWithoutDeleted(), ...newInvoices];
  const invoicesToShowArray = () => {
    const filteredInvoices = newInvoicesArray;

    if (filters && filters.length > 0) {
      return filteredInvoices.filter((invoice: IInvoice) =>
        filters.includes(invoice.status)
      );
    }
    return [];
  };*/

  useEffect(() => {
    const invoicesToShowArray = () => {
      if (filters && filters.length > 0) {
        return edittedInvoices.filter((invoice: IInvoice) =>
          filters.includes(invoice.status)
        );
      } else return [];
    };
    setInvoicesToShow(invoicesToShowArray);
  }, [edittedInvoices, filters]);

  const handleOpenNewInvoice = () => {
    setIsOpenNewInvoice(true);
  };

  return (
    <div
      className={`   grid content-center w-full max-w-[45.63rem] 2xl:max-w-[60rem] px-6 sm:px-12 md:px-0  `}
    >
      <div
        className={`${
          isOpenNewInvoice ? 'overflow-hidden max-h-svh' : ''
        } grid justify-items-center gap-y-4 content-start w-full `}
      >
        <Filter
          isOpenMenu={isOpenMenu}
          setIsOpenMenu={setIsOpenMenu}
          filters={filters}
          handleOpenNewInvoice={handleOpenNewInvoice}
        />

        {invoicesToShow && invoicesToShow.length > 0 ? (
          invoicesToShow.map((invoice: IInvoice) => (
            <InvoiceCard invoice={invoice} key={invoice.id} />
          ))
        ) : (
          <div className={`mt-16 md:mt-44 xl:mt-16`}>
            <NoInvoice />
          </div>
        )}
      </div>
      {isOpenNewInvoice && (
        <NewInvoice setIsOpenNewInvoice={setIsOpenNewInvoice} />
      )}
    </div>
  );
}
/*
        {invoicesStatus === 'loading' ? (
          <div>
            <Loading />
          </div>
        ) : invoicesStatus === 'succeeded' &&
          invoicesToShow &&
          invoicesToShow.length > 0 ? (
          invoicesToShow.map((invoice: IInvoice) => (
            <InvoiceCard invoice={invoice} key={invoice.id} />
          ))
        ) : invoicesStatus === 'succeeded' && invoicesToShow?.length == 0 ? (
          <div className={`mt-16 md:mt-44 xl:mt-16`}>
            <NoInvoice />
          </div>
        ) : invoicesStatus == 'failed' ? (
          <p>Error</p>
        ) : null}
         */
