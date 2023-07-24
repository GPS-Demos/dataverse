/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react";

import { NamedTypedPlace } from "../../shared/types";

interface ParentPlacePropsType {
  parentPlaces: NamedTypedPlace[];
  placeType: string;
  topic: string;
}

class ParentPlace extends React.Component<ParentPlacePropsType> {
  constructor(props: ParentPlacePropsType) {
    super(props);
  }

  render(): JSX.Element {
    const num = this.props.parentPlaces.length;
    return (
      <div>
        <span>{this.props.placeType} in </span>
        {this.props.parentPlaces &&
          this.props.parentPlaces.map((parent, index) => {
            if (index === num - 1) {
              return (
                <a
                  key={parent.dcid}
                  href={`/insights/#p=${parent.dcid}&t=${this.props.topic}`}
                >
                  {parent.name}
                </a>
              );
            }
            return (
              <React.Fragment key={parent.dcid}>
                <a href={`/insights/#p=${parent.dcid}&t=${this.props.topic}`}>
                  {parent.name}
                </a>
                {index < num - 1 && <span>, </span>}
              </React.Fragment>
            );
          })}
      </div>
    );
  }
}

export { ParentPlace };