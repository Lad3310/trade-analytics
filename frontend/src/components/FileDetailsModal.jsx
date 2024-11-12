import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function FileDetailsModal({ file, onClose }) {
  return (
    <Transition.Root show={true} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <div>
                  <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                    Trades in {file.filename}
                  </Dialog.Title>
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Symbol</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Quantity</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Counterparty</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {file.sample_trades?.map((trade, index) => (
                          <tr key={index}>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{trade.date}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{trade.symbol}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{trade.type}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{trade.quantity}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{trade.price}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{trade.counterparty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}