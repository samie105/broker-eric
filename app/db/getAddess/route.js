import { NextResponse } from "next/server";
import AddressModel from "../../../AddressDbmain";

export const revalidate = true;

export async function POST(request) {
  const { _id } = await request.json();
  console.log(_id);
  const address = await AddressModel.findOne({ _id });
  console.log(address);
  if (address) {
    // Convert to plain object and remove MongoDB specific fields
    const addressObj = address.toObject();
    delete addressObj._id;
    delete addressObj.__v;
    delete addressObj.id;
    return NextResponse.json(addressObj);
  } else {
    return NextResponse.json({ error: "no user found" });
  }
}
