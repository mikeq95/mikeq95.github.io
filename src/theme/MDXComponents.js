import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import { Icon } from '@iconify/react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import { Card, CardGrid } from '@site/src/components/Card';
import Columns from '@site/src/components/Columns';
import { Steps, Step } from '@site/src/components/Steps';

export default {
  ...MDXComponents,
  IIcon: Icon,
  Tabs,
  TabItem,
  Card,
  CardGrid,
  Columns,
  Steps,
  Step,
};