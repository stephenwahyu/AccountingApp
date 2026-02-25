import React from "react";

const HeadingSmall = ({ title, description }) => {
    return (
        <div className="space-y-0.5">
            <h2 className="text-xl font-bold tracking-tight">{title}</h2>
            {description && (
                <p className="text-muted-foreground text-sm">
                    {description}
                </p>
            )}
        </div>
    );
};

export default HeadingSmall;
