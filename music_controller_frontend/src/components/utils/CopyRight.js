import {Link, Typography} from "@mui/material";
import React from "react";

const CopyRight = () => {
    return (
        // mt是和上个元素的距离， mb是和下个元素的距离
        <Typography variant="body2" color="text.secondary" align="center" sx={{mt: 10}}>
            {'Copyright © '}
            <Link color="inherit" href="https://mui.com/">
                ShareMusic-Shuo.com
            </Link>
            {' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

export default CopyRight;