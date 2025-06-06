import dynamic from "next/dynamic";
import React from "react";
import { Dialog, DialogTrigger } from "../../ui/dialog";
import AuthUi from "../AuthUi/AuthUi";
import Link from "next/link";

export default function Footer() {
  return (
    <>
      <div className="footer-container bg-[#0a0a0a] p-5  text-white">
        <div className="grid-system grid gap-x-5 grid-cols-1 md:grid-cols-2  lg:grid-cols-4 ">
          <div className="grid1 my-10">
            <section className="broker-name text-3xl my-4">
              <svg
                width="198"
                height="32"
                viewBox="0 0 198 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.608 21.92C7.656 21.92 5.96 21.488 4.52 20.624C3.08 19.776 1.968 18.576 1.184 17.024C0.4 15.472 0.00800008 13.64 0.00800008 11.528C0.00800008 10.728 0.104 9.84 0.296 8.864C0.504 7.872 0.832 6.888 1.28 5.912C1.728 4.92 2.328 4.016 3.08 3.2C3.832 2.384 4.752 1.728 5.84 1.232C6.928 0.719999 8.208 0.464 9.68 0.464C10.944 0.464 12.048 0.624 12.992 0.943999C13.936 1.248 14.752 1.64 15.44 2.12C16.128 2.584 16.696 3.072 17.144 3.584C17.608 4.096 17.976 4.568 18.248 5C18.52 5.416 18.72 5.72 18.848 5.912L15.368 8.576C15.016 7.92 14.6 7.28 14.12 6.656C13.64 6.016 13.048 5.488 12.344 5.072C11.64 4.656 10.768 4.448 9.728 4.448C8.656 4.448 7.768 4.688 7.064 5.168C6.36 5.648 5.8 6.256 5.384 6.992C4.984 7.728 4.704 8.512 4.544 9.344C4.384 10.16 4.304 10.92 4.304 11.624C4.304 12.376 4.384 13.12 4.544 13.856C4.704 14.592 4.976 15.264 5.36 15.872C5.76 16.48 6.288 16.968 6.944 17.336C7.616 17.688 8.456 17.864 9.464 17.864C10.584 17.864 11.496 17.664 12.2 17.264C12.92 16.864 13.52 16.304 14 15.584C14.48 14.848 14.928 13.992 15.344 13.016L19.28 14.792C18.576 16.248 17.784 17.512 16.904 18.584C16.024 19.656 14.992 20.48 13.808 21.056C12.624 21.632 11.224 21.92 9.608 21.92ZM27.5744 21.896C26.3744 21.896 25.2864 21.584 24.3104 20.96C23.3344 20.352 22.5584 19.528 21.9824 18.488C21.4224 17.432 21.1424 16.256 21.1424 14.96C21.1424 13.744 21.3664 12.648 21.8144 11.672C22.2624 10.68 22.8704 9.832 23.6384 9.128C24.4224 8.424 25.3104 7.888 26.3024 7.52C27.2944 7.136 28.3344 6.944 29.4224 6.944C30.3344 6.944 31.2304 7.072 32.1104 7.328C32.1744 6.992 32.2304 6.656 32.2784 6.32L36.3824 7.016C36.2704 7.32 36.1584 7.776 36.0464 8.384C35.9344 8.992 35.8384 9.672 35.7584 10.424C35.6944 11.176 35.6384 11.928 35.5904 12.68C35.5424 13.432 35.5184 14.112 35.5184 14.72C35.5184 15.216 35.5504 15.704 35.6144 16.184C35.6944 16.648 35.8544 17.032 36.0944 17.336C36.3344 17.624 36.7024 17.768 37.1984 17.768H37.5344L36.9344 21.944C35.8784 21.944 35.0064 21.76 34.3184 21.392C33.6304 21.04 33.0784 20.56 32.6624 19.952C31.9744 20.72 31.1904 21.232 30.3104 21.488C29.4304 21.76 28.5184 21.896 27.5744 21.896ZM25.0784 15.44C25.1584 16.208 25.4704 16.824 26.0144 17.288C26.5744 17.736 27.2784 17.96 28.1264 17.96C28.9424 17.96 29.6224 17.744 30.1664 17.312C30.7104 16.864 31.1584 16.256 31.5104 15.488C31.4944 15.232 31.4864 14.968 31.4864 14.696C31.4864 14.136 31.5024 13.56 31.5344 12.968C31.5664 12.376 31.6064 11.792 31.6544 11.216C30.9824 10.96 30.2784 10.832 29.5424 10.832C28.6784 10.832 27.9024 11.008 27.2144 11.36C26.5424 11.696 26.0144 12.168 25.6304 12.776C25.2464 13.384 25.0544 14.088 25.0544 14.888C25.0544 14.984 25.0544 15.08 25.0544 15.176C25.0544 15.272 25.0624 15.36 25.0784 15.44ZM39.2268 26.816C39.1148 25.536 39.0348 24.248 38.9868 22.952C38.9388 21.656 38.9148 20.16 38.9148 18.464C38.9148 16.4 38.9468 14.344 39.0108 12.296C39.0748 10.248 39.1708 8.376 39.2988 6.68L43.4268 6.8C43.3788 7.168 43.3388 7.56 43.3068 7.976C43.8828 7.592 44.4988 7.312 45.1548 7.136C45.8268 6.96 46.5068 6.872 47.1948 6.872C48.0748 6.872 48.9308 7.016 49.7628 7.304C50.5948 7.576 51.3468 8.016 52.0188 8.624C52.6908 9.216 53.2188 9.984 53.6028 10.928C54.0028 11.872 54.2028 13.008 54.2028 14.336C54.2028 15.648 54.0028 16.792 53.6028 17.768C53.2028 18.744 52.6668 19.544 51.9948 20.168C51.3228 20.808 50.5708 21.28 49.7388 21.584C48.9068 21.904 48.0508 22.064 47.1708 22.064C45.5548 22.064 44.1308 21.584 42.8988 20.624C42.9308 21.648 42.9788 22.632 43.0428 23.576C43.1068 24.536 43.1868 25.512 43.2828 26.504L39.2268 26.816ZM46.5468 10.856C44.9628 10.856 43.7708 11.632 42.9708 13.184C42.9228 14.144 42.8908 15.12 42.8748 16.112C43.2588 16.624 43.7548 17.072 44.3628 17.456C44.9708 17.824 45.7468 18.008 46.6908 18.008C48.9468 18.008 50.0748 16.72 50.0748 14.144C50.0748 13.456 49.9468 12.896 49.6908 12.464C49.4348 12.032 49.1148 11.704 48.7308 11.48C48.3468 11.24 47.9548 11.08 47.5548 11C47.1548 10.904 46.8188 10.856 46.5468 10.856ZM55.8847 4.496C55.8847 4.352 55.8767 4.208 55.8607 4.064C55.8607 3.904 55.8607 3.728 55.8607 3.536C55.8607 3.024 55.8767 2.48 55.9087 1.904C55.9407 1.328 55.9727 0.839999 56.0047 0.439999L60.2767 0.511999C60.2287 1.056 60.1727 1.672 60.1087 2.36C60.0607 3.048 60.0287 3.76 60.0127 4.496H55.8847ZM55.7887 21.68C55.7407 20.688 55.7087 19.632 55.6927 18.512C55.6767 17.376 55.6687 16.24 55.6687 15.104C55.6687 13.616 55.6847 12.168 55.7167 10.76C55.7487 9.352 55.7887 8.072 55.8367 6.92L59.9647 6.896C59.9007 7.632 59.8607 8.544 59.8447 9.632C59.8287 10.704 59.8207 11.832 59.8207 13.016C59.8207 14.184 59.8287 15.336 59.8447 16.472C59.8607 17.608 59.8767 18.64 59.8927 19.568C59.9247 20.48 59.9487 21.184 59.9647 21.68H55.7887ZM69.4848 21.896C68.5248 21.896 67.7648 21.688 67.2048 21.272C66.6448 20.872 66.2368 20.312 65.9808 19.592C65.7248 18.872 65.5568 18.048 65.4768 17.12C65.4128 16.192 65.3808 15.216 65.3808 14.192C65.3808 13.136 65.4208 12.04 65.5008 10.904C64.4288 11.048 63.3968 11.232 62.4048 11.456L61.6608 7.688C62.9888 7.336 64.4048 7.08 65.9088 6.92C66.0208 6.104 66.1408 5.248 66.2688 4.352C66.3968 3.44 66.5408 2.48 66.7008 1.472L70.8288 1.832C70.6368 2.664 70.4688 3.496 70.3248 4.328C70.1808 5.144 70.0528 5.936 69.9408 6.704C70.8368 6.704 71.6768 6.728 72.4608 6.776C73.2608 6.808 73.9968 6.872 74.6688 6.968L74.1888 10.736C73.6288 10.672 73.0448 10.632 72.4368 10.616C71.8448 10.584 71.2448 10.568 70.6368 10.568C70.2688 10.568 69.9008 10.576 69.5328 10.592C69.4368 11.76 69.3728 12.76 69.3408 13.592C69.3248 14.424 69.3168 15.016 69.3168 15.368C69.3168 16.248 69.3648 16.88 69.4608 17.264C69.5728 17.648 69.7488 17.84 69.9888 17.84C70.2608 17.84 70.5648 17.752 70.9008 17.576C71.2368 17.384 71.5648 17.128 71.8848 16.808C72.2208 16.488 72.5008 16.144 72.7248 15.776L74.5728 19.64C72.9888 21.144 71.2928 21.896 69.4848 21.896ZM82.3948 21.896C81.1948 21.896 80.1068 21.584 79.1308 20.96C78.1548 20.352 77.3788 19.528 76.8027 18.488C76.2428 17.432 75.9628 16.256 75.9628 14.96C75.9628 13.744 76.1868 12.648 76.6348 11.672C77.0828 10.68 77.6908 9.832 78.4588 9.128C79.2428 8.424 80.1308 7.888 81.1228 7.52C82.1148 7.136 83.1548 6.944 84.2428 6.944C85.1548 6.944 86.0508 7.072 86.9308 7.328C86.9948 6.992 87.0508 6.656 87.0988 6.32L91.2028 7.016C91.0908 7.32 90.9788 7.776 90.8668 8.384C90.7548 8.992 90.6588 9.672 90.5788 10.424C90.5148 11.176 90.4588 11.928 90.4108 12.68C90.3628 13.432 90.3388 14.112 90.3388 14.72C90.3388 15.216 90.3708 15.704 90.4348 16.184C90.5148 16.648 90.6748 17.032 90.9148 17.336C91.1548 17.624 91.5228 17.768 92.0188 17.768H92.3548L91.7548 21.944C90.6988 21.944 89.8268 21.76 89.1388 21.392C88.4508 21.04 87.8988 20.56 87.4828 19.952C86.7948 20.72 86.0108 21.232 85.1308 21.488C84.2508 21.76 83.3388 21.896 82.3948 21.896ZM79.8988 15.44C79.9788 16.208 80.2908 16.824 80.8348 17.288C81.3948 17.736 82.0988 17.96 82.9468 17.96C83.7628 17.96 84.4428 17.744 84.9868 17.312C85.5308 16.864 85.9788 16.256 86.3308 15.488C86.3148 15.232 86.3068 14.968 86.3068 14.696C86.3068 14.136 86.3228 13.56 86.3548 12.968C86.3868 12.376 86.4268 11.792 86.4748 11.216C85.8028 10.96 85.0988 10.832 84.3628 10.832C83.4988 10.832 82.7228 11.008 82.0348 11.36C81.3628 11.696 80.8348 12.168 80.4508 12.776C80.0668 13.384 79.8748 14.088 79.8748 14.888C79.8748 14.984 79.8748 15.08 79.8748 15.176C79.8748 15.272 79.8828 15.36 79.8988 15.44ZM98.5351 21.896C97.6551 21.896 96.9271 21.704 96.3511 21.32C95.7911 20.952 95.3431 20.44 95.0071 19.784C94.6871 19.128 94.4471 18.376 94.2871 17.528C94.1431 16.68 94.0471 15.776 93.9991 14.816C93.9671 13.84 93.9511 12.864 93.9511 11.888C93.9511 11.04 93.9751 10.112 94.0231 9.104C94.0711 8.08 94.1271 7.048 94.1911 6.008C94.2711 4.952 94.3511 3.96 94.4311 3.032C94.5271 2.104 94.6151 1.296 94.6951 0.607999L99.0391 0.655999C98.9111 1.472 98.7911 2.4 98.6791 3.44C98.5671 4.464 98.4711 5.504 98.3911 6.56C98.3271 7.616 98.2711 8.592 98.2231 9.488C98.1911 10.384 98.1751 11.096 98.1751 11.624C98.1751 13.08 98.1991 14.224 98.2471 15.056C98.3111 15.888 98.3991 16.48 98.5111 16.832C98.6391 17.168 98.8071 17.336 99.0151 17.336C99.2871 17.336 99.5831 17.168 99.9031 16.832C100.223 16.48 100.535 16.088 100.839 15.656L102.879 19.712C102.383 20.256 101.791 20.752 101.103 21.2C100.415 21.664 99.5591 21.896 98.5351 21.896ZM139.634 21.92C138.098 21.92 136.746 21.616 135.578 21.008C134.426 20.416 133.522 19.584 132.866 18.512C132.226 17.44 131.906 16.2 131.906 14.792C131.906 13.944 132.05 13.056 132.338 12.128C132.626 11.184 133.09 10.304 133.73 9.488C134.37 8.672 135.21 8.008 136.25 7.496C137.306 6.984 138.586 6.728 140.09 6.728C141.178 6.728 142.09 6.848 142.826 7.088C143.578 7.328 144.186 7.64 144.65 8.024C145.13 8.408 145.49 8.816 145.73 9.248C145.986 9.68 146.154 10.096 146.234 10.496C146.33 10.88 146.378 11.2 146.378 11.456C146.378 13.008 145.722 14.208 144.41 15.056C143.114 15.888 141.274 16.304 138.89 16.304C138.346 16.304 137.826 16.28 137.33 16.232C136.85 16.184 136.402 16.128 135.986 16.064C136.29 16.864 136.794 17.456 137.498 17.84C138.202 18.208 138.93 18.392 139.682 18.392C140.77 18.392 141.73 18.2 142.562 17.816C143.394 17.416 144.178 16.808 144.914 15.992L147.05 19.064C146.538 19.48 145.962 19.912 145.322 20.36C144.698 20.808 143.93 21.176 143.018 21.464C142.106 21.768 140.978 21.92 139.634 21.92ZM140.162 10.328C139.218 10.328 138.386 10.568 137.666 11.048C136.946 11.528 136.418 12.16 136.082 12.944C136.482 13.008 136.874 13.064 137.258 13.112C137.658 13.144 138.05 13.16 138.434 13.16C138.786 13.16 139.186 13.128 139.634 13.064C140.098 13 140.546 12.904 140.978 12.776C141.426 12.648 141.794 12.488 142.082 12.296C142.37 12.088 142.514 11.848 142.514 11.576C142.514 11.448 142.45 11.288 142.322 11.096C142.194 10.904 141.962 10.728 141.626 10.568C141.29 10.408 140.802 10.328 140.162 10.328ZM151.718 22.04L148.694 19.424C149.462 18.528 150.286 17.624 151.166 16.712C152.046 15.784 152.95 14.864 153.878 13.952C152.758 12.976 151.71 12.104 150.734 11.336C149.774 10.552 149.03 10 148.502 9.68L150.902 6.512C151.766 7.136 152.702 7.848 153.71 8.648C154.718 9.448 155.734 10.296 156.758 11.192C157.702 10.328 158.63 9.488 159.542 8.672C160.454 7.84 161.326 7.056 162.158 6.32L164.942 9.2C164.43 9.568 163.702 10.176 162.758 11.024C161.814 11.856 160.79 12.784 159.686 13.808C160.742 14.768 161.734 15.72 162.662 16.664C163.606 17.592 164.438 18.456 165.158 19.256L162.23 21.92C161.942 21.568 161.526 21.112 160.982 20.552C160.438 19.992 159.806 19.368 159.086 18.68C158.382 17.992 157.63 17.288 156.83 16.568C156.062 17.32 155.334 18.048 154.646 18.752C153.974 19.456 153.382 20.088 152.87 20.648C152.358 21.224 151.974 21.688 151.718 22.04ZM172.378 21.968C171.354 21.968 170.506 21.784 169.834 21.416C169.178 21.064 168.65 20.576 168.25 19.952C167.866 19.328 167.578 18.632 167.386 17.864C167.21 17.08 167.09 16.272 167.026 15.44C166.978 14.592 166.954 13.776 166.954 12.992C166.954 12.096 166.978 11.184 167.026 10.256C167.09 9.328 167.154 8.312 167.218 7.208L171.61 6.944C171.562 7.28 171.49 7.784 171.394 8.456C171.298 9.128 171.21 9.896 171.13 10.76C171.05 11.624 171.01 12.528 171.01 13.472C171.01 15.024 171.146 16.176 171.418 16.928C171.69 17.664 172.098 18.032 172.642 18.032C173.73 18.032 174.53 17.24 175.042 15.656C175.554 14.072 175.81 11.568 175.81 8.144V7.04L177.85 6.992L180.322 6.944C180.098 8.448 179.93 9.832 179.818 11.096C179.706 12.36 179.634 13.424 179.602 14.288C179.57 15.136 179.554 15.704 179.554 15.992C179.554 16.728 179.618 17.256 179.746 17.576C179.874 17.88 180.098 18.032 180.418 18.032C180.578 18.032 180.754 18 180.946 17.936C181.138 17.872 181.362 17.76 181.618 17.6L181.45 21.728C180.842 21.824 180.314 21.872 179.866 21.872C179.098 21.872 178.466 21.728 177.97 21.44C177.49 21.152 177.106 20.768 176.818 20.288C176.322 20.816 175.706 21.224 174.97 21.512C174.25 21.816 173.386 21.968 172.378 21.968ZM190.653 21.992C189.565 21.992 188.557 21.864 187.629 21.608C186.701 21.352 185.861 21.024 185.109 20.624C184.357 20.224 183.685 19.8 183.093 19.352L185.253 15.872C185.925 16.496 186.573 16.976 187.197 17.312C187.821 17.648 188.469 17.88 189.141 18.008C189.829 18.136 190.573 18.2 191.373 18.2C192.061 18.2 192.613 18.112 193.029 17.936C193.445 17.744 193.653 17.504 193.653 17.216C193.653 16.976 193.453 16.792 193.053 16.664C192.653 16.52 192.141 16.4 191.517 16.304C190.893 16.192 190.237 16.056 189.549 15.896C188.573 15.64 187.661 15.344 186.813 15.008C185.965 14.672 185.277 14.216 184.749 13.64C184.237 13.064 183.981 12.296 183.981 11.336C183.981 10.568 184.165 9.896 184.533 9.32C184.901 8.728 185.389 8.24 185.997 7.856C186.621 7.456 187.325 7.16 188.109 6.968C188.893 6.776 189.701 6.68 190.533 6.68C191.973 6.68 193.213 6.856 194.253 7.208C195.309 7.544 196.317 7.992 197.277 8.552L195.093 11.864C194.613 11.528 194.061 11.24 193.437 11C192.829 10.744 192.213 10.552 191.589 10.424C190.981 10.28 190.413 10.208 189.885 10.208C189.309 10.208 188.853 10.296 188.517 10.472C188.197 10.648 188.037 10.896 188.037 11.216C188.037 11.408 188.237 11.592 188.637 11.768C189.053 11.928 189.837 12.144 190.989 12.416C191.677 12.576 192.405 12.744 193.173 12.92C193.941 13.08 194.661 13.312 195.333 13.616C196.021 13.904 196.573 14.328 196.989 14.888C197.421 15.432 197.637 16.16 197.637 17.072C197.637 18.608 197.021 19.808 195.789 20.672C194.557 21.552 192.845 21.992 190.653 21.992Z"
                  fill={`white`}
                />
                <path
                  d="M111.001 21.752C111.001 19.256 111.033 17.008 111.097 15.008C111.177 12.992 111.273 11.16 111.385 9.512C111.513 7.848 111.649 6.304 111.793 4.88C111.953 3.44 112.105 2.064 112.249 0.751999L116.377 0.92C116.313 1.416 116.241 1.952 116.161 2.528C116.705 3.264 117.297 4.104 117.937 5.048C118.593 5.992 119.257 6.992 119.929 8.048C120.617 9.088 121.289 10.136 121.945 11.192C122.601 12.232 123.225 13.232 123.817 14.192C124.409 15.136 124.929 15.984 125.377 16.736C125.489 15.632 125.545 14.08 125.545 12.08C125.545 11.056 125.529 10 125.497 8.912C125.465 7.824 125.425 6.784 125.377 5.792C125.329 4.784 125.265 3.888 125.185 3.104C125.105 2.304 125.017 1.68 124.921 1.232L129.433 0.679998C129.465 1.464 129.481 2.496 129.481 3.776C129.497 5.04 129.505 6.384 129.505 7.808C129.505 9.072 129.497 10.344 129.481 11.624C129.465 12.888 129.433 14.056 129.385 15.128C129.337 16.2 129.265 17.088 129.169 17.792C128.993 19.168 128.641 20.184 128.113 20.84C127.585 21.496 126.841 21.824 125.881 21.824C125.097 21.824 124.377 21.552 123.721 21.008C123.081 20.464 122.385 19.568 121.633 18.32C121.121 17.456 120.521 16.464 119.833 15.344C119.161 14.208 118.457 13.048 117.721 11.864C117.001 10.68 116.305 9.552 115.633 8.48C115.505 10.352 115.409 12.224 115.345 14.096C115.281 15.952 115.249 17.632 115.249 19.136C115.249 19.616 115.249 20.064 115.249 20.48C115.249 20.912 115.257 21.312 115.273 21.68L111.001 21.752Z"
                  fill="#0052FF"
                />
                <path
                  d="M76 20L38.689 30.6787C35.5949 31.5586 32.996 32 30.8944 32C28.5144 32 26.7867 31.4401 25.7157 30.3188C25.0421 29.5989 24.8445 28.6861 25.1207 27.5791C25.397 26.4721 26.1322 25.2937 27.3222 24.0395C28.3146 23.0254 29.9403 21.6927 32.2034 20.04C31.4358 20.8523 30.8729 21.7442 30.5374 22.6797C29.9424 24.3866 30.4779 25.6393 32.1439 26.4392C32.9365 26.812 34.0267 26.9992 35.4164 26.9992C36.5257 26.9992 37.7752 26.8792 39.165 26.6392L76 20Z"
                  fill="#0052FF"
                />
              </svg>
            </section>
            <section className="broker-writeup text-sm text-white/60  ">
              Capital Nexus is a financial investment company established by a
              group of professional traders and investors, who have fore seen
              the future of International Capital Market. The company has direct
              contracts with professional traders and miners around the world
              that guarantees the best services and ensures profits are made and
              remitted to investors daily.
            </section>
          </div>
          <div className="grid2 flex justify-center flex-col">
            <h2 className="text-xl my-4">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 mr-2"
                >
                  <path
                    fillRule="evenodd"
                    d="M19.902 4.098a3.75 3.75 0 00-5.304 0l-4.5 4.5a3.75 3.75 0 001.035 6.037.75.75 0 01-.646 1.353 5.25 5.25 0 01-1.449-8.45l4.5-4.5a5.25 5.25 0 117.424 7.424l-1.757 1.757a.75.75 0 11-1.06-1.06l1.757-1.757a3.75 3.75 0 000-5.304zm-7.389 4.267a.75.75 0 011-.353 5.25 5.25 0 011.449 8.45l-4.5 4.5a5.25 5.25 0 11-7.424-7.424l1.757-1.757a.75.75 0 111.06 1.06l-1.757 1.757a3.75 3.75 0 105.304 5.304l4.5-4.5a3.75 3.75 0 00-1.035-6.037.75.75 0 01-.354-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <p>Useful Links</p>
              </div>
            </h2>
            <div className="links focus:outline-none  focus:bg-none grid-cols-2 grid text-white/60 mx-2 transition-all cursor-pointer">
              {[
                "Getting Started",
                "About Us",
                "partners",
                "features & benefits",
                "testimonials",
                "FAQ",
              ].map((items) => {
                return (
                  <div
                    className="flex hover:text-white items-center my-2"
                    key={items}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4 mr-2 text-white"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                        clipRule="evenodd"
                      />
                    </svg>

                    <p className="text-sm capitalize">{items}</p>
                  </div>
                );
              })}
            </div>
            <Link href="/auth" passHref>
              <div className="flex items-center justify-center ">
                <div className="flex w-2/3 items-center justify-center md:w-full my-5 px-6 py-4 bg-[#0052FF] rounded-lg">
                  {" "}
                  <p className="text-sm text-white">Create account</p>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5 ml-2 text-white"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
          <div className="grid3">
            <h2 className="text-xl my-4">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 mr-2"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z"
                    clipRule="evenodd"
                  />
                  <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
                </svg>
                <p>Legal Information</p>
              </div>
            </h2>
            <div className="links focus:outline-none focus:bg-none grid-cols-1 grid text-white/60 mx-2 transition-all cursor-pointer">
              <Link href="/terms" passHref>
                <div className="flex hover:text-white items-center my-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4 mr-2 text-white"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm capitalize">Terms and Conditions</p>
                </div>
              </Link>
              <div className="flex hover:text-white items-center my-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 mr-2 text-white"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm capitalize">Privacy Policy</p>
              </div>
              <div className="flex hover:text-white items-center my-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 mr-2 text-white"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm capitalize">Compliance</p>
              </div>
            </div>
          </div>
          <div className="grid4">
            <h2 className="text-xl my-9">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6 mr-2"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.25 4.125c0-1.036.84-1.875 1.875-1.875h5.25c1.036 0 1.875.84 1.875 1.875V17.25a4.5 4.5 0 11-9 0V4.125zm4.5 14.25a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z"
                    clipRule="evenodd"
                  />
                  <path d="M10.719 21.75h9.156c1.036 0 1.875-.84 1.875-1.875v-5.25c0-1.036-.84-1.875-1.875-1.875h-.14l-8.742 8.743c-.09.089-.18.175-.274.257zM12.738 17.625l6.474-6.474a1.875 1.875 0 000-2.651L15.5 4.787a1.875 1.875 0 00-2.651 0l-.1.099V17.25c0 .126-.003.251-.01.375z" />
                </svg>

                <p>Contacts Information</p>
              </div>
            </h2>
            <div className="phone-container px-4 py-2 my-3 /bg-[#ffffff05] rounded-lg hover:bg-[#ffffff10] transition-all cursor-pointer flex  items-center justify-between">
              <section className="phone-section flex items-center ">
                <div className="icon p-3 rounded-full  mr-4 opacity-60">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                    />
                  </svg>
                </div>
                <div className="phonenum text-sm">
                  <div className="phone  text-gray-200 font-bold">
                    Phone Contact
                  </div>
                  <div className="phone text-gray-400 my-1 text-sm">
                    +1 (555) - 6488
                  </div>
                </div>
              </section>
              <section className="icon-section"></section>
            </div>
            <div className="email-container px-4 py-2 my-3 /bg-[#ffffff05] rounded-lg hover:bg-[#ffffff10] transition-all cursor-pointer flex  items-center justify-between">
              <section className="email-section flex items-center ">
                <div className="icon p-3 rounded-full  mr-4 opacity-60">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                </div>
                <div className="emailadd text-sm">
                  <div className="email  text-gray-200 font-bold">
                    E-mail Contact
                  </div>
                  <div className="phone text-gray-400 my-1 text-sm">
                    support@thekapitalnexus.com
                  </div>
                </div>
              </section>
              <section className="icon-section"></section>
            </div>
            <div className="address-container px-4 py-2 my-3 /bg-[#ffffff05] rounded-lg hover:bg-[#ffffff10] transition-all cursor-pointer flex  items-center justify-between">
              <section className="address-section flex items-center ">
                <div className="icon p-3 rounded-full  mr-4 opacity-60">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    />
                  </svg>
                </div>
                <div className="addressadd text-sm">
                  <div className="address  text-gray-200 font-bold">
                    Office Address
                  </div>
                  <div className="phone text-gray-400 my-1 text-sm">
                    4240 Atwaters center, CA 20032, USA
                  </div>
                </div>
              </section>
              <section className="icon-section"></section>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-message py-4 flex justify-center text-white/60 bg-[#0a0a0a] text-xs md:text-base">
        © 2023 thekapitalnexus.com All Rights Reserved.
      </div>
    </>
  );
}

//
//               <div>About Us</div>
//               <div>Partners</div>© 2023 Bittnovo.com All R
//               <div>Features & Benefits</div>
//               <div>Testimonials</div>
//               <div>FAQ</div>
