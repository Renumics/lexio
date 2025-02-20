import {FC, PropsWithChildren} from "react";
import {AppBarComponent} from "../ui/appbar";
import {Sidebar, SIDEBAR_WIDTH} from "../ui/sidebar.tsx";

type Props = PropsWithChildren

const ApplicationLayout: FC<Props> = (props: Props) => {
    const { children } = props;

    return (
        <div
            className={`grid overflow-hidden w-full h-full`}
            style={{
                gridTemplateColumns: `${SIDEBAR_WIDTH} 1fr`,
            }}
        >
            <Sidebar
                style={{ backgroundColor: "#fafafa00" }}
            />
            <div className={"grid grid-cols-1 h-full overflow-auto"}>
                <AppBarComponent />
                <div
                    className={"grid lg:grid-cols-1 overflow-hidden"}
                    style={{
                        height: "calc(100vh-var(--app-bar-height))",
                        marginTop: "calc(var(--app-bar-height))",
                    }}
                >
                    <div className={"grid grid-cols-1 justify-center overflow-hidden justify-items-center overflow-y-auto h-full w-full"}>
                        <main
                            className={"rounded-tl-[10px] w-full md:px-[7px] overflow-hidden"}
                            style={{
                                paddingRight: "var(--outer-padding)",
                                paddingLeft: "var(--outer-padding)",
                                width: "100%",
                                maxWidth: "var(--app-main-content-max-width)",
                            }}
                        >
                            {children}
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}
ApplicationLayout.displayName = "ApplicationLayout";

export default ApplicationLayout;
