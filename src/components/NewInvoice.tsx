'use client';
import { motion } from 'framer-motion';
import { MouseEvent, useState } from 'react';
import { Input } from './ui/Input';
import { AddNewItemButton, GoBackButton } from './ui/Buttons';
import { DiscardDraftSend } from './Footers/DiscardDraftSend';
import PaymentTermsMenu from './PaymentTermsMenu';
import Image from 'next/image';
import ArrowDown from '../images/icon-arrow-down.svg';
//npm i tailwind-scrollbar
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
//npm install react-hook-form
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { schema } from './constants/zSchema';
import { formatDateBack, todayDay } from '@/app/actions/formatDate';
import { nanoid } from 'nanoid';
import { IInvoice } from './Types';
import { useDispatch } from 'react-redux';
import { setNewInvoices } from '@/app/redux/slices/invoicesSlice';

export default function NewInvoice({
  setIsOpenNewInvoice,
  isOpenNewInvoice,
}: {
  setIsOpenNewInvoice: (isOpenNewInvoice: boolean) => void;
  isOpenNewInvoice: boolean;
}) {
  const dispatch = useDispatch();
  const [startDate, setStartDate] = useState(new Date());
  const [items, setItems] = useState([nanoid(6)]);
  const [isDraft, setIsDraft] = useState(false);
  const handleGoBack = () => {
    setIsOpenNewInvoice(false);
  };
  const [isPaymentTermsMenu, setIsPaymentTermsMenu] = useState(false);

  type FormFields = z.infer<typeof schema>;

  const methods = useForm<FormFields>({
    mode: 'onBlur',
    defaultValues: {
      id: nanoid(6),
      createdAt: todayDay(),
    },
    resolver: zodResolver(schema),
  });

  const {
    trigger,
    register,
    unregister,
    handleSubmit,
    watch,
    formState: { errors },
    getValues,
    setValue,
  } = methods;

  const handleAddItem = (e: MouseEvent) => {
    e.preventDefault();
    const newItem = nanoid(6);
    setItems([...items, newItem]);
  };

  function handleDeleteItem(
    e: React.MouseEvent<HTMLButtonElement>,
    item: string | undefined,
    thisindex: number
  ) {
    e.preventDefault();
    if (items.length > 1) {
      const newItems = items.filter((thisitem) => thisitem !== item);
      setItems(newItems);
      const formItems = getValues('items');
      const newFormItems = formItems.filter(
        (_item, index: number) => index !== thisindex
      );
      unregister('items');
      setValue('items', newFormItems);
    }
  }

  const paymentTerms = watch(`paymentTerms`);
  function countPaymentDue(paymentTerms: number, startDate: Date) {
    if (startDate && paymentTerms) {
      const firstDate = new Date(startDate);
      const result = firstDate.setDate(
        firstDate.getDate() + Number(paymentTerms)
      );
      const DueDate = new Date(result);
      setValue(`paymentDue`, formatDateBack(DueDate).toString());
    }
  }
  countPaymentDue(Number(paymentTerms), startDate);

  function itemTotal(index: number) {
    const price = watch(`items.${index}.price`);
    const qty = watch(`items.${index}.quantity`);
    const total = price * qty;
    if (total > 0) {
      setValue(`items.${index}.total`, total);
      return total;
    } else {
      return '0.00';
    }
  }

  function countInvoiceTotal() {
    const formItems = getValues('items');
    if (formItems?.length > 0) {
      const totalValues = formItems.map((item) => item.total);
      if (totalValues.length > 0) {
        const initialValue = 0;
        const sumOfTotalValues = totalValues.reduce(
          (acc, num) => acc + Number(num),
          initialValue
        );
        setValue(`total`, sumOfTotalValues);
      }
    }
  }
  countInvoiceTotal();

  const formSubmit: SubmitHandler<IInvoice> = (data) => {
    trigger();
    dispatch(setNewInvoices(data));
  };

  const haveErrors = () => {
    return Object.keys(errors).length > 0 ? true : false;
  };

  return (
    <motion.div
      className={`sm:overflow-hidden absolute left-0 top-[4.5rem] grid place-items-start   md:top-[5rem] xl:top-0 xl:left-[6.44rem]  z-2 
        w-full xl:w-[calc(100vw-6.44rem)] h-svh  sm:h-[calc(100vh-4.5rem)] md:h-[calc(100vh-5rem)] xl:h-full bg-black bg-opacity-50  min-w-80`}
      key="shadow"
      initial={{ zIndex: 2 }}
      animate={{ zIndex: 2 }}
    >
      {isOpenNewInvoice && (
        <motion.div
          className={` sm:flex bg-card dark:bg-dark-background sm:h-[calc(100vh-8rem)] xl:h-[calc(100vh-4rem)]   sm:pr-4 sm:absolute sm:rounded-r-b20`}
          key="form"
          initial={{ left: -616 }}
          animate={{ left: 0 }}
          transition={{ duration: 0.3 }}
          exit={{ left: -616 }}
        >
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(formSubmit)}>
              <div
                className={` pl-6 pr-2 w-full h-full  bg-card dark:bg-dark-background max-w-[37.5rem] sm:h-[calc(100vh-8.5rem)]   sm:rounded-r-b20 
            sm:overflow-y-scroll  dark:scrollbar-track-dark-background scrollbar-track-card scrollbar-thumb-muted-darker dark:scrollbar-thumb-dark-filter scrollbar-thin`}
              >
                <div>
                  <div className={` h-20 grid content-center mt-1  sm:hidden`}>
                    <GoBackButton onClick={handleGoBack} />
                  </div>
                  <h2
                    className={`font-bold text-2xl leading-8 sm:mt-4 xl:mt-8 text-foreground dark:text-primary-foreground tracking-tight  capitalize`}
                  >
                    New invoice
                  </h2>

                  <section>
                    <p className={`black15 text-primary capitalize mb-5 mt-5`}>
                      Bill from
                    </p>
                    <Input
                      label="street address"
                      {...register(`senderAddress.street`, {
                        required: !isDraft ? true : false,
                      })}
                      errorMessage={errors?.senderAddress?.street?.message}
                    />
                    <div className={`grid items-end grid-cols-2 gap-x-6`}>
                      <Input
                        label="city"
                        {...register(`senderAddress.city`, {
                          required: !isDraft ? true : false,
                        })}
                        errorMessage={errors?.senderAddress?.city?.message}
                      />
                      <Input
                        label="post code"
                        {...register(`senderAddress.postCode`, {
                          required: !isDraft ? true : false,
                        })}
                        errorMessage={errors?.senderAddress?.postCode?.message}
                      />
                      <Input
                        label="country"
                        className={`col-span-2`}
                        {...register(`senderAddress.country`, {
                          required: !isDraft ? true : false,
                        })}
                        errorMessage={errors?.senderAddress?.country?.message}
                      />
                    </div>
                  </section>
                  <section>
                    <p className={`black15 text-primary capitalize mb-5 mt-5`}>
                      Bill to
                    </p>
                    <Input
                      label="client's name"
                      {...register(`clientName`, {
                        required: !isDraft ? true : false,
                      })}
                      errorMessage={errors?.clientName?.message}
                    />

                    <Input
                      label="client's email"
                      {...register(`clientEmail`, {
                        required: !isDraft ? true : false,
                      })}
                      errorMessage={errors?.clientEmail?.message}
                    />
                    <Input
                      label="street address"
                      {...register(`clientAddress.street`, {
                        required: !isDraft ? true : false,
                      })}
                      errorMessage={errors?.clientAddress?.street?.message}
                    />
                    <div className={`grid items-end grid-cols-2 gap-x-6`}>
                      <Input
                        label="city"
                        {...register(`clientAddress.city`, {
                          required: !isDraft ? true : false,
                        })}
                        errorMessage={errors?.clientAddress?.city?.message}
                      />
                      <Input
                        label="post code"
                        {...register(`clientAddress.postCode`, {
                          required: !isDraft ? true : false,
                        })}
                        errorMessage={errors?.clientAddress?.postCode?.message}
                      />
                      <Input
                        label="country"
                        className={`col-span-2`}
                        {...register(`clientAddress.country`, {
                          required: !isDraft ? true : false,
                        })}
                        errorMessage={errors?.clientAddress?.country?.message}
                      />
                    </div>
                    <div
                      className={`grid justify-items-stretch  sm:grid-cols-2  sm:gap-x-6  mb-3`}
                    >
                      <article>
                        <div className={`mb-4 w-full grid`}>
                          <p
                            className={`grey13 capitalize mt-1 mb-3 dark:text-muted-darker`}
                          >
                            Invoice date
                          </p>
                          <DatePicker
                            cssClass="e-custom-style"
                            dateFormat="dd MMM yyyy"
                            selected={startDate}
                            onChange={(date: Date | null) => {
                              if (date !== null) {
                                setStartDate(date);
                                setValue(`createdAt`, formatDateBack(date));
                              }
                            }}
                            className={`justify-self-stretch w-full min-w-full px-5 py-4 border dark:bg-dark-header dark:border-dark-filter dark:text-primary-foreground rounded focus:outline-none focus:ring-1 focus:ring-primary hover:ring-1 hover:ring-primary black15 bg-[url('../images/icon-calendar.svg')] bg-[right_1rem_bottom_1rem] bg-no-repeat`}
                          />
                        </div>
                      </article>

                      <article className={`relative`}>
                        <div
                          className={`grid items-end grid-cols-[auto,auto] gap-x-0.5`}
                        >
                          <p
                            className={`grey13 dark:text-muted-darker capitalize mt-1 mb-1  ${
                              errors.paymentTerms ? 'text-delete' : ''
                            }`}
                          >
                            Payment terms
                          </p>

                          {errors.paymentTerms && (
                            <p className={`text-delete text-xs text-right`}>
                              {errors.paymentTerms.message}
                            </p>
                          )}
                        </div>
                        <button
                          className={`dark:bg-dark-header dark:text-primary-foreground grid grid-cols-2 items-center text-left capitalize mt-2 w-full h-14 px-5 py-4 border ${
                            errors.paymentTerms
                              ? 'border-delete'
                              : 'dark:border-dark-filter'
                          } rounded focus:outline-none focus:ring-1 focus:ring-primary hover:ring-1 hover:ring-primary hover:cursor-pointer black15`}
                          onClick={(e) => {
                            e.preventDefault();
                            setIsPaymentTermsMenu(!isPaymentTermsMenu);
                          }}
                        >
                          {paymentTerms ? (
                            <p>
                              <span>Net </span>
                              {paymentTerms}
                              {paymentTerms == 1 ? (
                                <span> day</span>
                              ) : (
                                <span> days</span>
                              )}
                            </p>
                          ) : (
                            <span></span>
                          )}
                          <Image
                            className={`justify-self-end ${
                              isPaymentTermsMenu ? 'rotate-180' : ''
                            }`}
                            src={ArrowDown}
                            alt="v"
                          />
                        </button>
                        {isPaymentTermsMenu && (
                          <PaymentTermsMenu
                            setIsPaymentTermsMenu={setIsPaymentTermsMenu}
                          />
                        )}
                      </article>
                    </div>
                    <Input
                      label="project description"
                      {...register(`description`, {
                        required: !isDraft ? true : false,
                      })}
                      errorMessage={errors?.description?.message}
                    />
                  </section>
                  <section className={`pb-4 sm:pb-9`}>
                    <p
                      className={`mt-14 mb-4 capitalize text-card-foreground font-bold text-lg leading-8 tracking-tight`}
                    >
                      Item list
                    </p>
                    <div
                      className={`hidden sm:grid sm:grid-cols-[4fr,1.5fr,2fr,2fr,1fr] sm:gap-4 sm:mb-6 w-full grey13 dark:text-muted-darker`}
                    >
                      <p>Item name</p>
                      <p className={`text-center sm:text-left`}>Qty.</p>
                      <p className={`text-right sm:text-left`}>Price</p>
                      <p className={`text-right sm:text-left`}>Total</p>
                    </div>
                    {items.map((item, index) => (
                      <div
                        key={item}
                        className={`grid items-end grid-cols-[4fr,6fr,4fr,2fr]  sm:grid-cols-[4fr,1.5fr,2fr,2fr,1fr] gap-4 mb-8`}
                      >
                        <p
                          className={`grey13 dark:text-muted-darker capitalize sm:hidden col-span-4 sm:col-span-1 mb-[-0.8rem]`}
                        >
                          Item name
                        </p>
                        <Input
                          className={`row-start-2  col-span-4 sm:row-start-1 sm:col-span-1`}
                          {...register(`items.${index}.name`, {
                            required: !isDraft ? true : false,
                          })}
                          errorMessage={errors?.items?.[index]?.name?.message}
                        />
                        <p
                          className={`grey13 dark:text-muted-darker capitalize sm:hidden mb-[-0.8rem]`}
                        >
                          Qty.
                        </p>
                        <Input
                          type="number"
                          className={`row-start-4 sm:row-start-1 sm:col-start-2`}
                          {...register(`items.${index}.quantity`, {
                            valueAsNumber: true,
                            required: !isDraft ? true : false,
                          })}
                          errorMessage={
                            errors?.items?.[index]?.quantity?.message
                          }
                        />
                        <p
                          className={`grey13 dark:text-muted-darker capitalize sm:hidden mb-[-0.8rem]`}
                        >
                          Price
                        </p>
                        <Input
                          type="number"
                          className={`row-start-4 sm:row-start-1 sm:col-start-3`}
                          {...register(`items.${index}.price`, {
                            valueAsNumber: true,
                            required: !isDraft ? true : false,
                          })}
                          errorMessage={errors?.items?.[index]?.price?.message}
                        />
                        <p
                          className={`grey13 dark:text-muted-darker capitalize sm:hidden mb-[-0.8rem]`}
                        >
                          Total
                        </p>

                        <p
                          className={` grid items-center mb-8 row-start-4 sm:row-start-1 sm:col-start-4 black15 text-card-foreground`}
                        >
                          {Number(itemTotal(index)).toFixed(2)}
                        </p>
                        <div
                          className={` justify-self-end mb-8 sm:justify-self-center grid place-items-center row-start-4 sm:row-start-1 sm:col-start-5`}
                        >
                          <button
                            value={item}
                            onClick={(e) => handleDeleteItem(e, item, index)}
                          >
                            <svg
                              width="13"
                              height="16"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M11.583 3.556v10.666c0 .982-.795 1.778-1.777 1.778H2.694a1.777 1.777 0 01-1.777-1.778V3.556h10.666zM8.473 0l.888.889h3.111v1.778H.028V.889h3.11L4.029 0h4.444z"
                                fill="#888EB0"
                                fillRule="nonzero"
                                className={`w-[0.81rem] h-4 p-2 hover:fill-delete transition-colors duration-200`}
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    <AddNewItemButton handleAddItem={handleAddItem} />

                    {haveErrors() ? (
                      <p className={`text-delete text-xs font-semibold mt-8`}>
                        - All fields must be added
                      </p>
                    ) : null}
                  </section>
                </div>
              </div>
              <motion.div
                className={` sm:fixed sm:left-0 xl:left-[6.44rem] xl:ml-[6.44rem] sm:bottom-0 pt-14 w-full max-w-[38.5rem] bg-card dark:bg-dark-background sm:rounded-br-b20 `}
                key="footer"
                initial={{ left: -616 }}
                animate={{ left: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={`grid w-full   place-items-center  sm:place-items-end sm:rounded-r-b20 bg-card dark:bg-dark-background shadow-shadowUp   px-6 py-5 `}
                >
                  <DiscardDraftSend
                    handleGoBack={handleGoBack}
                    onSubmit={handleSubmit(formSubmit)}
                    setIsDraft={setIsDraft}
                  />
                </div>
              </motion.div>
            </form>
          </FormProvider>
        </motion.div>
      )}
    </motion.div>
  );
}
