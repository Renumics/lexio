import {FC} from "react";
import {SIDEBAR_WIDTH} from "./sidebar";

export const NAV_BAR_TITLE_CONTAINER_ID = "nav-bar-title-container";

export const AppBarComponent: FC = () => {
    return (
        <nav
            className={"grid fixed top-0 left-0 z-[1000] h-[var(--app-bar-height)] grid-rows-[1fr_max-content] backdrop-blur backdrop-filter py-2 px-[var(--outer-padding)]"}
            style={{
                // boxShadow: "0 0 3px gray",
                // borderColor: "#e5e7eb",
                marginLeft: SIDEBAR_WIDTH,
                width: `calc(100dvw - ${SIDEBAR_WIDTH})`,
            }}
        >
            <div
                className="grid grid-cols-[1fr_max-content] gap-[20px] content-center items-center pt-[20px] h-full md:p-[calc(var(--gap-1)+5px)]"
                style={{
                    margin: "auto",
                    width: "100%",
                    maxWidth: "var(--app-main-content-max-width)",
                    // paddingRight: "var(--outer-padding)",
                    // paddingLeft: "var(--outer-padding)",
                }}
            >
                <div id={NAV_BAR_TITLE_CONTAINER_ID} className={"flex gap-3 content-center items-center"}>
                    <div className={"mt-1"}>RAG UI</div>
                </div>
                <div className="flex gap-2">
                    <a
                        href="https://renumics.com/open-source/docs/lexio"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 text-gray-600 hover:text-gray-900"
                    >
                        Docs
                    </a>
                    <a
                        href="https://github.com/renumics/lexio"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path fillRule="evenodd"
                                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                  clipRule="evenodd"/>
                        </svg>
                        GitHub
                    </a>
                </div>
            </div>
        </nav>
    );
}
AppBarComponent.displayName = "AppBarComponent";
