import React from "react";

type Prop1 = {
  title: string;
  heading1: string;
  price1: string;
  heading2: string;
  price2: string;
  heading3: string;
  price3: string;
  heading4: string;
  price4: string;
};

type Prop2 = {
  title2: string;
  heading5: string;
  price5: string;
  heading6: string;
  price6: string;
  heading7: string;
  price7: string;
  heading8: string;
  price8: string;
};

type Prop3 = {
  title3: string;
  heading9: string;
  price9: string;
  heading10: string;
  price10: string;
  heading11: string;
  price11: string;
  heading12: string;
  price12: string;
};

const MarketCard1 = ({
  title,
  heading1,
  price1,
  heading2,
  price2,
  heading3,
  price3,
  heading4,
  price4,
}: Prop1) => {
  return (
    <div className="borders w-[349px] min-h-[235px] bg-transparent py-[16px] px-[22px] rounded-[10px]">
      <h1 className="text-[24px] font-bold">{title}</h1>
      <div className="flex pt-[20px] space-x-[16px] items-start justify-between">
        <div className="flex flex-col items-start space-y-12">
          <div>
            <h1 className="text-[15px] text-slate-400 font-medium">{heading1}</h1>
            {price1 !== undefined ? (
              <p>${price1.toLocaleString()}</p>
            ) : (
              <p>Price not available</p>
            )}
          </div>
          <div>
            <h1 className="text-[15px] text-slate-400 font-medium">{heading2}</h1>
            {price2 !== undefined ? (
              <p>${price2.toLocaleString()}</p>
            ) : (
              <p>Price not available</p>
            )}
          </div>
        </div>
        <div className="cardborder-content2" />
        <div className="flex flex-col items-start space-y-12">
          <div>
            <h1 className="text-[15px] text-slate-400 font-medium">{heading3}</h1>
            <p>{price3}</p>
          </div>
          <div>
            <h1 className="text-[15px] text-slate-400 font-medium">{heading4}</h1>
            {price4 !== undefined ? (
              <p>{price4.toLocaleString()}</p>
            ) : (
              <p>Price not available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MarketCard2 = ({
  title2,
  heading5,
  price5,
  heading6,
  price6,
  heading7,
  price7,
  heading8,
  price8,
}: Prop2) => {
  return (
    <div className="borders w-[349px] min-h-[235px] bg-transparent py-[16px] px-[22px] rounded-[10px]">
      <h1 className="text-[24px] font-bold">{title2}</h1>
      <div className="flex pt-[20px] space-x-[16px] items-start justify-between">
        <div className="flex flex-col items-start space-y-12">
          <div>
            <h1 className="text-[15px] text-slate-400 font-medium">{heading5}</h1>
            {price5 !== undefined ? (
              <p>${price5.toLocaleString()}</p>
            ) : (
              <p>Price not available</p>
            )}
          </div>
          <div>
            <h1 className="text-[15px] text-slate-400 font-medium">{heading6}</h1>
            <p>{price6}</p>
          </div>
        </div>
        <div className="cardborder-content2" />
        <div className="flex flex-col items-start space-y-12">
          <div>
            <h1 className="text-[15px] text-slate-400 font-medium">{heading7}</h1>
            <p>{price7}</p>
          </div>
          <div>
            <h1 className="text-[15px] text-slate-400 font-medium">{heading8}</h1>
            {price8 !== undefined ? (
              <p>{price8.toLocaleString()}</p>
            ) : (
              <p>Price not available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MarketCard3 = ({
  title3,
  heading9,
  price9,
  heading10,
  price10,
  heading11,
  price11,
  heading12,
  price12,
}: Prop3) => {
  return (
    <div className="borders w-[349px] min-h-[235px] bg-transparent py-[16px] px-[22px] rounded-[10px]">
      <h1 className="text-[24px] font-bold">{title3}</h1>
      <div className="flex pt-[20px] space-x-[16px] items-start justify-between">
        <div className="flex flex-col items-start space-y-12">
          <div>
            <h1 className="text-[15px] text-slate-400 font-medium">{heading9}</h1>
            <p>{price9}</p>
          </div>
          <div>
            <h1 className="text-[15px] text-slate-400 font-medium">{heading10}</h1>
            <p>${price10}</p>
          </div>
        </div>
        <div className="cardborder-content2" />
        <div className="flex flex-col items-start space-y-12">
          <div>
            <h1 className="text-[15px] text-slate-400 font-medium">{heading11}</h1>
            <p>{price11}</p>
          </div>
          <div>
            <h1 className="text-[15px] text-slate-400 font-medium">{heading12}</h1>
            <p>{price12}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export { MarketCard1, MarketCard2, MarketCard3 };

  