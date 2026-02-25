import React from "react";
import { Separator } from "@/components/ui/separator";

const Heading = ({ title, description }) => {
    return (
        <div className="space-y-4 mb-6">
            <div className="space-y-0.5">
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                {description && (
                    <p className="text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            <Separator className="my-6" />
        </div>
    );
};

export default Heading;
