import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { Lighting, Axis, Grid } from "../../components";

// TODO: Refactor these to state
const ENABLE_XZ_GRID = false;
const ENABLE_YZ_GRID = false;

const SceneEnvironment: React.FC = () => {
  const { gridEnabled } = useSelector((state: RootState) => state.settings);

  return (
    <>
      <Lighting />
      <Axis />
      {gridEnabled && <Grid size={4} plane="XY" />}
      {ENABLE_XZ_GRID && <Grid size={10} plane="XZ" />}
      {ENABLE_YZ_GRID && <Grid size={10} plane="YZ" />}
    </>
  );
};

export default SceneEnvironment;
