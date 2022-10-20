import React from "react";

function Spinner({ bgColor }) {
	return (
		<div className="spinner">
			<div style={{ backgroundColor: bgColor }} class="circle-core"></div>
		</div>
	);
}

export default Spinner;
