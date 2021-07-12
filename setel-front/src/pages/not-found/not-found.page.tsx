import { Link } from "react-router-dom";

import  classes  from "./not-found.module.css";

const NotFound = () => {
    return (
        <div className={classes.root}>
            <div className={classes.main}>
                <div className={classes.headingContainer}>
                    <h1 className={classes.heading}>
                        4<span>0</span>4
                    </h1>
                </div>
                <p className={classes.description}>
                    Not Found
                </p>
                <Link to="/">
                    <button>  Homepage </button>
                </Link>
            </div>
        </div>
    );
};

export default NotFound