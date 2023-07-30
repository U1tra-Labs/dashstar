import React from "react";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export const Box = () => {
  return (
    <div className="flex box flex-row items-center justify-center">
      <div className="group-wrapper">
        <div className="group">
          <div className="overlap">
            <div className="overlap-group-wrapper">
              <div className="overlap-group">
                <div className="frame flex items-center justify-center  p-[29px] rounded-full">
                  <div className="text-wrapper text-white font-bold">Ratio</div>
                  <div className="div text-white">0.0</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
