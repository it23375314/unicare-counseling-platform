function Payment() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">Payment</h2>

      <div className="bg-white p-6 rounded shadow mt-4">
        <p>Session Fee: Rs. 2000</p>

        <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded">
          Pay Now
        </button>
      </div>
    </div>
  );
}

export default Payment;
