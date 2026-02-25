// 




import React from "react";
import { Link } from "react-router-dom";
import { FaHeartbeat } from "react-icons/fa";
import dashboardImg from "../images/dashboard.png";

export default function Hero() {
  return (
    <div className="min-h-screen bg-[#F5F1ED] relative">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 lg:px-12 pt-16 pb-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Content */}
          <div className="space-y-6">
            {/* Tags */}
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="bg-[#E8DFF5] text-[#6B5B7C] px-4 py-2 rounded-full font-medium">
                Risk Screening
              </span>
              <span className="bg-[#DFD1E8] text-[#6B5B7C] px-4 py-2 rounded-full font-medium">
                AI Prediction
              </span>
              <span className="bg-[#E5D9F2] text-[#6B5B7C] px-4 py-2 rounded-full font-medium">
                Clinical Dashboard
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl lg:text-6xl font-bold text-[#4A3B5C] leading-tight">
              Early 
              <br />
              Detection
              <br />
              <span className="text-[#4A3B5C]">Saves Lives.</span>
            </h1>

            {/* Description */}
            <p className="text-lg text-[#6B5B7C] leading-relaxed max-w-xl">
              Turning routine data into life-saving insights. Our AI-driven platform detects early signs of heart conditions, empowering you to take control of your health and make informed decisions for a healthier future.
            </p>

            {/* CTA Section */}
            <div className="flex items-center gap-6 flex-wrap">
              <Link 
                to="/ai"
                className="group"
              >
                <div className="relative">
                  <div className="flex items-center gap-3 bg-gradient-to-r from-[#8B7FCF] via-[#9D8FD9] to-[#B8A4C9] text-white font-semibold px-8 py-4 rounded-full shadow-2xl transition-all duration-300 group-hover:shadow-3xl overflow-hidden border-2 border-white group-hover:scale-105 animate-bounce-slow animate-blink-soft">
                    <div className="p-1">
                      <FaHeartbeat className="text-2xl animate-pulse drop-shadow-lg" />
                    </div>
                    <span className="font-semibold text-lg whitespace-nowrap max-w-0 group-hover:max-w-xs opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:pr-2 drop-shadow-lg">
                      Start AI Assessment
                    </span>
                  </div>
                  <div className="absolute inset-0 rounded-full bg-[#8B7FCF] opacity-40 animate-ping"></div>
                  <div className="absolute inset-0 rounded-full bg-[#B8A4C9] opacity-30 animate-ping" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#8B7FCF] to-[#B8A4C9] blur-xl opacity-60 animate-pulse"></div>
                </div>
              </Link>
              
              <div className="flex items-center gap-3">
                <div className="bg-[#E8DFF5] w-14 h-14 rounded-full flex items-center justify-center">
                  <span className="text-[#6B5B7C] font-bold text-lg">94%</span>
                </div>
                <div className="text-sm">
                  <p className="text-[#8B7B9C]"><span className="font-semibold text-[#6B5B7C]">ROC-AUC</span></p>
                  <p className="text-[#8B7B9C]">Model Accuracy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="relative">
            <div className="relative">
              {/* Symmetric Top Cards */}
              <div className="absolute top-6 left-6 bg-[#E8DFF5] rounded-2xl shadow-lg p-6 w-60 z-10">
                <h3 className="text-3xl font-bold text-[#4A3B5C] mb-2">10M+</h3>
                <p className="text-sm text-[#6B5B7C] mb-4">
                  Every year
                  <br />
                  helping people
                  <br />
                  around the world
                </p>
                <div className="flex gap-1 mb-2">
                  <img src="https://i.pravatar.cc/40?img=1" alt="Customer" className="w-10 h-10 rounded-full border-2 border-white" />
                  <img src="https://i.pravatar.cc/40?img=2" alt="Customer" className="w-10 h-10 rounded-full border-2 border-white -ml-3" />
                  <img src="https://i.pravatar.cc/40?img=3" alt="Customer" className="w-10 h-10 rounded-full border-2 border-white -ml-3" />
                </div>
                <div className="bg-[#D4C5E0] text-xs text-[#6B5B7C] px-3 py-1 rounded-full inline-block font-medium">Campaign</div>
              </div>

              <div className="absolute top-6 right-6 bg-[#E8DFF5] rounded-2xl shadow-lg p-6 w-60 z-10">
                <h3 className="text-3xl font-bold text-[#4A3B5C] mb-2">Overview</h3>
                <p className="text-sm text-[#6B5B7C] mb-4">Quick stats and latest updates to keep you informed.</p>
                <div className="bg-[#D4C5E0] text-xs text-[#6B5B7C] px-3 py-1 rounded-full inline-block font-medium">Reports</div>
              </div>

              {/* Main Image (Centered) */}
              <div className="mt-12 bg-[#DFD1E8] rounded-[3rem] overflow-hidden h-[450px] relative mx-auto max-w-[520px]">
                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&q=80" alt="Happy customer" className="w-full h-full object-cover" />
                <div className="absolute top-6 left-6 text-6xl opacity-70">🌿</div>
              </div>

              {/* Chat Interface - Bottom Right for symmetry */}
              <div className="absolute bottom-6 right-6 bg-[#E8DFF5] rounded-2xl shadow-xl p-4 w-64">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm text-[#8B7B9C]">Chat now</span>
                </div>
                <div className="flex items-center gap-3">
                  <img src="https://i.pravatar.cc/40?img=9" alt="Event Manager" className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="text-xs text-[#8B7B9C]">Hi, Event Manager</p>
                    <p className="text-sm font-semibold text-[#4A3B5C]">Hello</p>
                  </div>
                  <button className="ml-auto text-[#8B7FCF]">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Second Section - Support */}
      <section className="max-w-7xl mx-auto px-8 lg:px-12 py-35">
        <div className="bg-[#D4C5E0] rounded-[3rem] overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0 items-center">
            
            {/* Left Image */}
            <div className="relative h-full min-h-[400px] flex items-center justify-center p-6">
              <div className="w-full h-full bg-gradient-to-br from-[#B8A4C9] to-[#9D8FD9] rounded-br-[5rem] overflow-hidden shadow-2xl">
                <img 
                  src={dashboardImg} 
                  alt="CardioShield Dashboard" 
                  className="w-full h-full object-contain p-4 drop-shadow-lg"
                />
              </div>
            </div>

            {/* Right Content */}
            <div className="p-12 lg:p-16 space-y-6 relative">
              <h2 className="text-4xl lg:text-5xl font-bold text-[#4A3B5C] leading-tight">
                Let's make <span className="font-normal">Heart Health</span>
                <br />
                <span className="font-normal">Simple &</span> Accessible
              </h2>
              
              <p className="text-[#6B5B7C] text-lg leading-relaxed max-w-md">
                Early detection is key to preventing cardiovascular diseases.
                Our AI-powered platform makes heart health screening accessible to everyone.
              </p>

              <div className="pt-4">
                <Link to="/ai" className="inline-block bg-[#8B7FCF] hover:bg-[#7A6DBE] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg border-2 border-[#9D8FD9]">
                  Start Assessment
                </Link>
              </div>

              <p className="text-[#6B5B7C] text-sm pt-2">
                Take control of your heart health today.
                <br />
                Prevention starts with awareness.
              </p>

              {/* Decorative Heart Icon */}
              <div className="absolute bottom-12 right-12">
                <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                  <FaHeartbeat className="w-6 h-6 text-[#8B7FCF]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}