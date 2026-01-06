import { Component, VNode } from "preact";

interface Props {
    fallback: VNode;
    children: any;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: any) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: any) {
        // Anda bisa log error ke service analytics jika perlu
        console.error("🔥 Spline Scene Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Jika error, render Fallback UI (Kotak Loading/Pesan Error)
            return this.props.fallback;
        }

        // Jika aman, render Children (Scene 3D)
        return this.props.children;
    }
}