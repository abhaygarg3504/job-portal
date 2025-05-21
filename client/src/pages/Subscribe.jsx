import React, { useContext } from 'react';
import Navbar from '../components/Navbar';
import { assets, plans } from '../assets/assets';
import { useUser } from '@clerk/clerk-react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';

const Subscribe = () => {
  const { user } = useUser();
  const { backendURL } = useContext(AppContext);

  const handlePayment = async (plan) => {
    if (!user) return alert("Please login first");

    try {
      const { data } = await axios.post(`${backendURL}/api/users/pay-razor`, {
        userId: user.id,
        planId: plan.id,
      });

      if (!data.success) {
        return alert("Failed to create Razorpay order");
      }

      // Step 2: Open Razorpay UI
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // use VITE_ if using Vite
        amount: data.order.amount,
        currency: "INR",
        name: "Job Portal",
        description: `${plan.id} Subscription`,
        order_id: data.order.id,
        handler: async function (response) {
           const verifyRes = await axios.post(`${backendURL}/api/users/verify-razor`, {
            razorpay_order_id: response.razorpay_order_id,
          });

          if (verifyRes.data.success) {
            alert("Payment successful. You are now a Pro user!");
            window.location.reload(); // optional
          } else {
            alert("Payment verification failed.");
          }
        },
        prefill: {
          name: user.fullName || "User",
          email: user.primaryEmailAddress.emailAddress,
        },
        theme: {
          color: "#000000",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Payment Error:", err);
      alert("Something went wrong during payment.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-[80vh] text-center pt-14 mb-10">
        <button className="border border-gray-400 px-10 py-2 rounded-full mb-6">Our Plans</button>
        <h1 className="text-center text-3xl font-medium mb-6 sm:mb-10">Choose the plan</h1>

        <div className="flex flex-wrap justify-center gap-6 text-left">
          {plans.map((item, index) => (
            <div
              className="bg-white drop-shadow-sm border rounded-lg py-12 px-8 text-gray-600 hover:scale-105 transition-all duration-500"
              key={index}
            >
              <img width={40} src={assets.logo_icon} alt="" />
              <p className="mt-3 mb-1 font-semibold">{item.id}</p>
              <p className="text-sm">{item.desc}</p>
              <p className="mt-6">
                <span className="text-3xl font-medium">₹{item.price}</span>/{item.durationInMonths} months
              </p>
              <button
                className="w-full bg-gray-800 text-white mt-8 text-sm rounded-md py-2.5 min-w-52"
                onClick={() => handlePayment(item)}
              >
                {user ? "Purchase" : "Get Started"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Subscribe;
